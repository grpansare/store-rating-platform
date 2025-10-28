const express = require('express');
const { pool } = require('../config/database');
const { validateStore } = require('../middleware/validation');
const { authenticateToken, requireAdmin, requireAuth, requireAdminOrStoreOwner } = require('../middleware/auth');

const router = express.Router();

// Get store owner dashboard data
router.get('/owner/dashboard', authenticateToken, requireAdminOrStoreOwner, async (req, res) => {
  try {
    // Get the store owned by this user
    const [stores] = await pool.execute(
      'SELECT id, name, email, address FROM stores WHERE owner_id = ?',
      [req.user.id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'No store found for this owner' });
    }

    const storeId = stores[0].id;

    // Get average rating for the store
    const [ratingData] = await pool.execute(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    // Get users who rated the store
    const [raters] = await pool.execute(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json({
      store: stores[0],
      averageRating: ratingData[0].average_rating || 0,
      totalRatings: ratingData[0].total_ratings || 0,
      raters
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all stores with ratings
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
    
    // Simple query that WILL work
    let baseQuery = 'SELECT id, name, email, address, owner_id FROM stores WHERE 1=1';
    let queryParams = [];

    // Add search filters
    if (search) {
      baseQuery += ' AND (name LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Add sorting
    const validSortFields = ['name', 'email', 'address'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      baseQuery += ' ORDER BY name ASC';
    }

  // Add pagination
const limitNum = parseInt(limit) || 10;
const pageNum = parseInt(page) || 1;
const offsetNum = (pageNum - 1) * limitNum;

// ✅ Fix: use interpolation instead of placeholders for LIMIT/OFFSET
baseQuery += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

console.log('Store Query:', baseQuery);
console.log('Store Params:', queryParams);

const [stores] = await pool.execute(baseQuery, queryParams);


    // Add ratings data to each store (separate queries to avoid SQL issues)
    for (let store of stores) {
      try {
        // Get average rating and total ratings for this store
        const [ratingData] = await pool.execute(
          'SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
          [store.id]
        );
        
        // Get user's rating for this store
        const [userRating] = await pool.execute(
          'SELECT rating FROM ratings WHERE store_id = ? AND user_id = ?',
          [store.id, req.user.id]
        );
        
        store.average_rating = ratingData[0]?.avg_rating || 0;
        store.total_ratings = ratingData[0]?.total_ratings || 0;
        store.user_rating = userRating[0]?.rating || null;
      } catch (ratingError) {
        console.log('Rating query error for store', store.id, ':', ratingError.message);
        store.average_rating = 0;
        store.total_ratings = 0;
        store.user_rating = null;
      }
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM stores WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      stores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get store by ID
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [stores] = await pool.execute(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as total_ratings,
              ur.rating as user_rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
       WHERE s.id = ?
       GROUP BY s.id, s.name, s.email, s.address, s.owner_id, ur.rating`,
      [req.user.id, id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store: stores[0] });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new store (Admin only)
router.post('/', authenticateToken, requireAdmin, validateStore, async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check if store email already exists
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existingStores.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // If owner_id is provided, verify the user exists and is a store_owner
    if (owner_id) {
      const [owners] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND role = "store_owner"',
        [owner_id]
      );

      if (owners.length === 0) {
        return res.status(400).json({ error: 'Invalid owner ID or user is not a store owner' });
      }
    }

    // Insert new store
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: result.insertId,
        name,
        email,
        address,
        owner_id: owner_id || null
      }
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update store (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, owner_id } = req.body;

    // Check if store exists
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [id]
    );

    if (existingStores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if email is already taken by another store
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM stores WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email is already in use by another store' });
      }
    }

    // If owner_id is provided, verify the user exists and is a store_owner
    if (owner_id) {
      const [owners] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND role = "store_owner"',
        [owner_id]
      );

      if (owners.length === 0) {
        return res.status(400).json({ error: 'Invalid owner ID or user is not a store owner' });
      }
    }

    // Update store
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (address) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }

    if (owner_id !== undefined) {
      updateFields.push('owner_id = ?');
      updateValues.push(owner_id === null ? null : owner_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updateQuery = `UPDATE stores SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    await pool.execute(updateQuery, updateValues);

    res.json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete store (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if store exists
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [id]
    );

    if (existingStores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Delete store (ratings will be cascade deleted due to foreign key constraint)
    await pool.execute('DELETE FROM stores WHERE id = ?', [id]);

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

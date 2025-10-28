const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { validateUser } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics (Admin only)
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users');
    
    // Get users by role
    const [usersByRole] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    // Get total stores count
    const [storeCount] = await pool.execute('SELECT COUNT(*) as total FROM stores');
    
    // Get total ratings count
    const [ratingCount] = await pool.execute('SELECT COUNT(*) as total FROM ratings');
    
    res.json({
      totalUsers: userCount[0].total,
      totalStores: storeCount[0].total,
      totalRatings: ratingCount[0].total,
      usersByRole
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    let queryParams = [];

    // Add search filters
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (role && role !== 'all') {
      query += ' AND role = ?';
      queryParams.push(role);
    }

    // Add sorting
    const validSortFields = ['name', 'email', 'role', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination
    const page_num = parseInt(page) || 1;
    const limit_num = parseInt(limit) || 10;
    const offset = (page_num - 1) * limit_num;
   query += ` LIMIT ${limit_num} OFFSET ${offset}`;


    const [users] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (role && role !== 'all') {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              CASE 
                WHEN u.role = 'store_owner' THEN (
                  SELECT AVG(r.rating) 
                  FROM stores s 
                  LEFT JOIN ratings r ON s.id = r.store_id 
                  WHERE s.owner_id = u.id
                )
                ELSE NULL
              END as average_rating
       FROM users u 
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, validateUser, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate role
    const validRoles = ['admin', 'user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        name,
        email,
        address,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email already taken by another user' });
      }
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'user', 'store_owner'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin
    if (existingUsers[0].role === 'admin') {
      const [adminCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
      );

      if (adminCount[0].count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Delete user (ratings will be deleted due to CASCADE)
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics (Admin only)
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    // Get total stores
    const [storeCount] = await pool.execute('SELECT COUNT(*) as count FROM stores');
    
    // Get total ratings
    const [ratingCount] = await pool.execute('SELECT COUNT(*) as count FROM ratings');

    // Get users by role
    const [roleStats] = await pool.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count,
      usersByRole: roleStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

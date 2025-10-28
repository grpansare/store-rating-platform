const express = require('express');
const { pool } = require('../config/database');
const { validateRating } = require('../middleware/validation');
const { authenticateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Submit or update rating
router.post('/', authenticateToken, requireAuth, validateRating, async (req, res) => {
  try {
    const { store_id, rating, comment } = req.body;
    const user_id = req.user.id;
    
    console.log('Rating submission data:', { store_id, rating, comment, user_id });

    // Check if store exists
    const [stores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [store_id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRating] = await pool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      console.log('Updating existing rating with comment:', comment);
      await pool.execute(
        'UPDATE ratings SET rating = ?, comment = ? WHERE user_id = ? AND store_id = ?',
        [rating, comment || null, user_id, store_id]
      );
      console.log('Rating updated successfully in database');

      res.json({ message: 'Rating updated successfully' });
    } else {
      // Insert new rating
      console.log('Inserting new rating with comment:', comment);
      await pool.execute(
        'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, store_id, rating, comment || null]
      );
      console.log('New rating inserted successfully in database');

      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's rating for a specific store
router.get('/store/:store_id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { store_id } = req.params;
    const user_id = req.user.id;

    const [ratings] = await pool.execute(
      'SELECT rating, comment, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    if (ratings.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: ratings[0] });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all ratings by current user
router.get('/my-ratings', authenticateToken, requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [ratings] = await pool.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              s.id as store_id, s.name as store_name, s.address as store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.updated_at DESC`,
      [user_id]
    );

    res.json({ ratings });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete rating
router.delete('/store/:store_id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { store_id } = req.params;
    const user_id = req.user.id;

    // Check if rating exists
    const [existingRating] = await pool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    if (existingRating.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Delete rating
    await pool.execute(
      'DELETE FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

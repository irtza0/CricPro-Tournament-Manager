const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Admin only
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:id - Admin or self
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { full_name, avatar_url } = req.body;
    const result = await query(
      `UPDATE users SET full_name = COALESCE($1, full_name), avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3 RETURNING id, username, email, full_name, role, avatar_url`,
      [full_name, avatar_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Admin only (soft delete)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await query('UPDATE users SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;

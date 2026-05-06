const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/teams
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*, u.full_name AS manager_name,
             (SELECT COUNT(*) FROM players p WHERE p.team_id = t.id AND p.is_active = TRUE) AS player_count
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      WHERE t.is_active = TRUE
      ORDER BY t.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const teamResult = await query(`
      SELECT t.*, u.full_name AS manager_name
      FROM teams t LEFT JOIN users u ON t.manager_id = u.id
      WHERE t.id = $1`, [req.params.id]);
    if (teamResult.rows.length === 0) return res.status(404).json({ error: 'Team not found' });

    const playersResult = await query(
      'SELECT * FROM players WHERE team_id = $1 AND is_active = TRUE ORDER BY jersey_number',
      [req.params.id]
    );

    res.json({ ...teamResult.rows[0], players: playersResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/teams - Admin only
router.post('/', authenticate, authorize('admin', 'team_manager'), [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('short_name').trim().isLength({ min: 2, max: 10 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, short_name, logo_url, home_ground, founded_year, manager_id } = req.body;
    const result = await query(
      `INSERT INTO teams (name, short_name, logo_url, home_ground, founded_year, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, short_name, logo_url, home_ground, founded_year, manager_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/teams/:id
router.put('/:id', authenticate, authorize('admin', 'team_manager'), async (req, res) => {
  try {
    const { name, short_name, logo_url, home_ground, founded_year, manager_id } = req.body;
    const result = await query(
      `UPDATE teams SET name = COALESCE($1, name), short_name = COALESCE($2, short_name),
       logo_url = COALESCE($3, logo_url), home_ground = COALESCE($4, home_ground),
       founded_year = COALESCE($5, founded_year), manager_id = COALESCE($6, manager_id)
       WHERE id = $7 RETURNING *`,
      [name, short_name, logo_url, home_ground, founded_year, manager_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Team not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/teams/:id - Admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await query('UPDATE teams SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Team deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;

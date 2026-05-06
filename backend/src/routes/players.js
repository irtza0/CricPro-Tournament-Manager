const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/players
router.get('/', async (req, res) => {
  try {
    const { team_id, role: playerRole, search } = req.query;
    let sql = `SELECT p.*, t.name AS team_name, t.short_name AS team_short
               FROM players p LEFT JOIN teams t ON p.team_id = t.id WHERE p.is_active = TRUE`;
    const params = [];

    if (team_id) { params.push(team_id); sql += ` AND p.team_id = $${params.length}`; }
    if (playerRole) { params.push(playerRole); sql += ` AND p.role = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      // FIX: Use separate param slots for first_name and last_name to be safe
      sql += ` AND (p.first_name ILIKE $${idx} OR p.last_name ILIKE $${idx})`;
    }

    sql += ' ORDER BY p.first_name, p.last_name';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /players error:', err); // FIX: log the real error
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET /api/players/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, t.name AS team_name FROM players p
      LEFT JOIN teams t ON p.team_id = t.id WHERE p.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /players/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// POST /api/players
router.post('/', authenticate, authorize('admin', 'team_manager'), [
  body('first_name').trim().isLength({ min: 1, max: 50 }),
  body('last_name').trim().isLength({ min: 1, max: 50 }),
  body('role').isIn(['batsman', 'bowler', 'all_rounder', 'wicket_keeper']),
  body('batting_style').isIn(['right_hand', 'left_hand']),
  body('team_id').optional({ nullable: true }).isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { first_name, last_name, date_of_birth, nationality, role: playerRole,
            batting_style, bowling_style, jersey_number, team_id, avatar_url } = req.body;
    const result = await query(
      `INSERT INTO players (first_name, last_name, date_of_birth, nationality, role,
       batting_style, bowling_style, jersey_number, team_id, avatar_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [first_name, last_name, date_of_birth || null, nationality || null, playerRole,
       batting_style, bowling_style || 'none', jersey_number || null, team_id || null, avatar_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /players error:', err); // FIX: log the real error
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PUT /api/players/:id
router.put('/:id', authenticate, authorize('admin', 'team_manager'), async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, nationality, role: playerRole,
            batting_style, bowling_style, jersey_number, team_id, avatar_url } = req.body;

    // FIX: Only use COALESCE for truly required fields that must never be null.
    // Optional fields are assigned directly so they can be cleared to null.
    const params = [
      first_name   || null,   // $1  — required, COALESCE keeps old if null
      last_name    || null,   // $2  — required, COALESCE keeps old if null
      date_of_birth !== undefined ? (date_of_birth || null) : undefined,  // $3
      nationality  !== undefined ? (nationality  || null) : null,          // $4
      playerRole   || null,   // $5  — required, COALESCE keeps old if null
      batting_style || null,  // $6  — required, COALESCE keeps old if null
      bowling_style !== undefined ? (bowling_style || 'none') : null,      // $7
      jersey_number !== undefined ? (jersey_number === '' ? null : jersey_number) : null, // $8
      team_id      !== undefined ? (team_id === '' ? null : team_id) : null,              // $9
      avatar_url   !== undefined ? (avatar_url   === '' ? null : avatar_url) : null,      // $10
      req.params.id  // $11
    ];

    // Replace undefined (not sent) with a sentinel so COALESCE skips them
    const finalParams = params.map(v => (v === undefined ? null : v));

    const result = await query(
      `UPDATE players SET 
       first_name    = COALESCE($1, first_name), 
       last_name     = COALESCE($2, last_name),
       date_of_birth = COALESCE($3, date_of_birth), 
       nationality   = $4,
       role          = COALESCE($5, role), 
       batting_style = COALESCE($6, batting_style),
       bowling_style = COALESCE($7, bowling_style), 
       jersey_number = $8,
       team_id       = $9, 
       avatar_url    = $10,
       updated_at    = NOW()
       WHERE id = $11 AND is_active = TRUE RETURNING *`,
      finalParams
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /players/:id error:', err); // FIX: log the real error
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /api/players/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await query('UPDATE players SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Player deactivated' });
  } catch (err) {
    console.error('DELETE /players/:id error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
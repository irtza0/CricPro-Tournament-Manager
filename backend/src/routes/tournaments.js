const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/tournaments
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT t.*, u.full_name AS created_by_name,
               (SELECT COUNT(*) FROM tournament_teams tt WHERE tt.tournament_id = t.id) AS team_count
               FROM tournaments t LEFT JOIN users u ON t.created_by = u.id`;
    const params = [];
    if (status) { params.push(status); sql += ` WHERE t.status = $1`; }
    sql += ' ORDER BY t.start_date DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// GET /api/tournaments/:id
router.get('/:id', async (req, res) => {
  try {
    const tResult = await query('SELECT * FROM tournaments WHERE id = $1', [req.params.id]);
    if (tResult.rows.length === 0) return res.status(404).json({ error: 'Tournament not found' });

    const teamsResult = await query(`
      SELECT t.*, tt.group_name, tt.seed_number FROM tournament_teams tt
      JOIN teams t ON tt.team_id = t.id WHERE tt.tournament_id = $1 ORDER BY tt.group_name, tt.seed_number`,
      [req.params.id]);

    const matchesResult = await query(`
      SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
      FROM matches m JOIN teams t1 ON m.team1_id = t1.id JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id WHERE m.tournament_id = $1 ORDER BY m.match_date`,
      [req.params.id]);

    const pointsResult = await query(`
      SELECT pt.*, t.name AS team_name, t.short_name FROM points_table pt
      JOIN teams t ON pt.team_id = t.id WHERE pt.tournament_id = $1
      ORDER BY pt.points DESC, pt.net_run_rate DESC`, [req.params.id]);

    res.json({
      ...tResult.rows[0], teams: teamsResult.rows,
      matches: matchesResult.rows, points_table: pointsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tournament details' });
  }
});

// POST /api/tournaments
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().isLength({ min: 3 }),
  body('format').isIn(['T20', 'ODI', 'Test', 'T10', 'The Hundred']),
  body('start_date').isDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, format, start_date, end_date, venue, description, max_teams } = req.body;
    const result = await query(
      `INSERT INTO tournaments (name, format, start_date, end_date, venue, description, max_teams, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, format, start_date, end_date, venue, description, max_teams, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// POST /api/tournaments/:id/teams - Add team to tournament
router.post('/:id/teams', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { team_id, group_name, seed_number } = req.body;
    const result = await query(
      `INSERT INTO tournament_teams (tournament_id, team_id, group_name, seed_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, team_id, group_name, seed_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Team already in tournament' });
    res.status(500).json({ error: 'Failed to add team' });
  }
});

// PUT /api/tournaments/:id
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, format, start_date, end_date, venue, status, description } = req.body;
    const result = await query(
      `UPDATE tournaments SET name=COALESCE($1,name), format=COALESCE($2,format),
       start_date=COALESCE($3,start_date), end_date=COALESCE($4,end_date),
       venue=COALESCE($5,venue), status=COALESCE($6,status), description=COALESCE($7,description)
       WHERE id=$8 RETURNING *`,
      [name, format, start_date, end_date, venue, status, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tournament not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

module.exports = router;

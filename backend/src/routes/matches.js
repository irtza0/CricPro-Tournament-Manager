const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/matches
router.get('/', async (req, res) => {
  try {
    const { tournament_id, status, team_id } = req.query;
    let sql = `SELECT m.*, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
               t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo,
               w.name AS winner_name, tn.name AS tournament_name
               FROM matches m
               JOIN teams t1 ON m.team1_id = t1.id JOIN teams t2 ON m.team2_id = t2.id
               LEFT JOIN teams w ON m.winner_id = w.id
               JOIN tournaments tn ON m.tournament_id = tn.id WHERE 1=1`;
    const params = [];
    if (tournament_id) { params.push(tournament_id); sql += ` AND m.tournament_id = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND m.status = $${params.length}`; }
    if (team_id) { params.push(team_id); sql += ` AND (m.team1_id = $${params.length} OR m.team2_id = $${params.length})`; }
    sql += ' ORDER BY m.match_date DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// GET /api/matches/:id
router.get('/:id', async (req, res) => {
  try {
    const matchResult = await query(`
      SELECT m.*, t1.name AS team1_name, t2.name AS team2_name,
             w.name AS winner_name, tw.name AS toss_winner_name, tn.name AS tournament_name
      FROM matches m JOIN teams t1 ON m.team1_id = t1.id JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id LEFT JOIN teams tw ON m.toss_winner_id = tw.id
      JOIN tournaments tn ON m.tournament_id = tn.id WHERE m.id = $1`, [req.params.id]);
    if (matchResult.rows.length === 0) return res.status(404).json({ error: 'Match not found' });

    const innings = await query('SELECT * FROM match_innings WHERE match_id = $1 ORDER BY innings_number', [req.params.id]);

    const batting = await query(`
      SELECT bs.*, p.first_name, p.last_name, t.name AS team_name
      FROM batting_scorecards bs JOIN players p ON bs.player_id = p.id
      JOIN teams t ON bs.team_id = t.id WHERE bs.match_id = $1
      ORDER BY bs.team_id, bs.batting_order`, [req.params.id]);

    const bowling = await query(`
      SELECT bw.*, p.first_name, p.last_name, t.name AS team_name
      FROM bowling_scorecards bw JOIN players p ON bw.player_id = p.id
      JOIN teams t ON bw.team_id = t.id WHERE bw.match_id = $1
      ORDER BY bw.team_id`, [req.params.id]);

    res.json({
      ...matchResult.rows[0], innings: innings.rows,
      batting_scorecard: batting.rows, bowling_scorecard: bowling.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
});

// POST /api/matches
router.post('/', authenticate, authorize('admin'), [
  body('tournament_id').matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  body('team1_id').matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  body('team2_id').matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  body('match_date').custom((value) => {
    // Accept both ISO8601 and datetime-local format (YYYY-MM-DDTHH:MM)
    if (!value) throw new Error('Match date is required');
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?$/;
    if (!isoPattern.test(value)) throw new Error('Invalid date format');
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return true;
  }),
  body('match_type').isIn(['group', 'quarter_final', 'semi_final', 'final', 'playoff', 'friendly']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { tournament_id, team1_id, team2_id, match_date, venue, match_type, overs } = req.body;
    if (team1_id === team2_id) return res.status(400).json({ error: 'Teams must be different' });

    const result = await query(
      `INSERT INTO matches (tournament_id, team1_id, team2_id, match_date, venue, match_type, overs)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tournament_id, team1_id, team2_id, match_date, venue, match_type, overs || 20]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// PUT /api/matches/:id
router.put('/:id', authenticate, authorize('admin', 'team_manager'), async (req, res) => {
  try {
    const { status, toss_winner_id, toss_decision, winner_id, result_summary, venue, match_date } = req.body;
    const result = await query(
      `UPDATE matches SET status=COALESCE($1,status), toss_winner_id=COALESCE($2,toss_winner_id),
       toss_decision=COALESCE($3,toss_decision), winner_id=COALESCE($4,winner_id),
       result_summary=COALESCE($5,result_summary), venue=COALESCE($6,venue),
       match_date=COALESCE($7,match_date) WHERE id=$8 RETURNING *`,
      [status, toss_winner_id, toss_decision, winner_id, result_summary, venue, match_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Match not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

module.exports = router;

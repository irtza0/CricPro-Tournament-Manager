const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/scorecards/batting
router.post('/batting', authenticate, authorize('admin', 'team_manager'), [
  body('match_id').isUUID(), body('player_id').isUUID(), body('team_id').isUUID(),
  body('runs_scored').isInt({ min: 0 }), body('balls_faced').isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { match_id, player_id, team_id, batting_order, runs_scored, balls_faced,
            fours, sixes, is_out, dismissal_type, bowler_id, fielder_id } = req.body;
    const result = await query(
      `INSERT INTO batting_scorecards (match_id, player_id, team_id, batting_order, runs_scored,
       balls_faced, fours, sixes, is_out, dismissal_type, bowler_id, fielder_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [match_id, player_id, team_id, batting_order, runs_scored, balls_faced,
       fours||0, sixes||0, is_out||false, dismissal_type, bowler_id, fielder_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Entry already exists' });
    res.status(500).json({ error: 'Failed to add batting entry' });
  }
});

// POST /api/scorecards/bowling
router.post('/bowling', authenticate, authorize('admin', 'team_manager'), [
  body('match_id').isUUID(), body('player_id').isUUID(), body('team_id').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { match_id, player_id, team_id, overs_bowled, maidens, runs_conceded, wickets, no_balls, wides } = req.body;
    const result = await query(
      `INSERT INTO bowling_scorecards (match_id, player_id, team_id, overs_bowled, maidens,
       runs_conceded, wickets, no_balls, wides) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [match_id, player_id, team_id, overs_bowled||0, maidens||0, runs_conceded||0, wickets||0, no_balls||0, wides||0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Entry already exists' });
    res.status(500).json({ error: 'Failed to add bowling entry' });
  }
});

// POST /api/scorecards/innings
router.post('/innings', authenticate, authorize('admin', 'team_manager'), async (req, res) => {
  try {
    const { match_id, batting_team_id, bowling_team_id, innings_number, total_runs, total_wickets, total_overs, extras } = req.body;
    const result = await query(
      `INSERT INTO match_innings (match_id, batting_team_id, bowling_team_id, innings_number,
       total_runs, total_wickets, total_overs, extras) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [match_id, batting_team_id, bowling_team_id, innings_number, total_runs||0, total_wickets||0, total_overs||0, extras||0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add innings' });
  }
});

// GET /api/scorecards/match/:matchId
router.get('/match/:matchId', async (req, res) => {
  try {
    const innings = await query('SELECT * FROM match_innings WHERE match_id=$1 ORDER BY innings_number', [req.params.matchId]);
    const batting = await query(`SELECT bs.*, p.first_name, p.last_name, t.name AS team_name
      FROM batting_scorecards bs JOIN players p ON bs.player_id=p.id JOIN teams t ON bs.team_id=t.id
      WHERE bs.match_id=$1 ORDER BY bs.team_id, bs.batting_order`, [req.params.matchId]);
    const bowling = await query(`SELECT bw.*, p.first_name, p.last_name, t.name AS team_name
      FROM bowling_scorecards bw JOIN players p ON bw.player_id=p.id JOIN teams t ON bw.team_id=t.id
      WHERE bw.match_id=$1`, [req.params.matchId]);
    res.json({ innings: innings.rows, batting: batting.rows, bowling: bowling.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scorecard' });
  }
});

module.exports = router;

const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// GET /api/stats/top-scorers
router.get('/top-scorers', async (req, res) => {
  try {
    const { tournament_id, limit = 10 } = req.query;
    let sql = `SELECT p.id, p.first_name || ' ' || p.last_name AS player_name,
               t.name AS team_name, t.short_name, p.role AS player_role,
               COUNT(bs.id) AS innings, SUM(bs.runs_scored) AS total_runs,
               SUM(bs.balls_faced) AS total_balls, SUM(bs.fours) AS total_fours,
               SUM(bs.sixes) AS total_sixes, MAX(bs.runs_scored) AS highest_score,
               ROUND(AVG(bs.runs_scored), 2) AS batting_avg,
               ROUND(SUM(bs.runs_scored)*100.0/NULLIF(SUM(bs.balls_faced),0), 2) AS strike_rate
               FROM batting_scorecards bs
               JOIN players p ON bs.player_id = p.id JOIN teams t ON bs.team_id = t.id`;
    const params = [];
    if (tournament_id) {
      params.push(tournament_id);
      sql += ` JOIN matches m ON bs.match_id = m.id WHERE m.tournament_id = $1`;
    }
    sql += ` GROUP BY p.id, p.first_name, p.last_name, t.name, t.short_name, p.role
             ORDER BY total_runs DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top scorers' });
  }
});

// GET /api/stats/top-wicket-takers
router.get('/top-wicket-takers', async (req, res) => {
  try {
    const { tournament_id, limit = 10 } = req.query;
    let sql = `SELECT p.id, p.first_name || ' ' || p.last_name AS player_name,
               t.name AS team_name, t.short_name,
               COUNT(bw.id) AS innings, SUM(bw.wickets) AS total_wickets,
               SUM(bw.overs_bowled) AS total_overs, SUM(bw.runs_conceded) AS runs_conceded,
               ROUND(AVG(bw.economy_rate), 2) AS avg_economy,
               ROUND(SUM(bw.runs_conceded)/NULLIF(SUM(bw.wickets),0), 2) AS bowling_avg
               FROM bowling_scorecards bw
               JOIN players p ON bw.player_id = p.id JOIN teams t ON bw.team_id = t.id`;
    const params = [];
    if (tournament_id) {
      params.push(tournament_id);
      sql += ` JOIN matches m ON bw.match_id = m.id WHERE m.tournament_id = $1`;
    }
    sql += ` GROUP BY p.id, p.first_name, p.last_name, t.name, t.short_name
             ORDER BY total_wickets DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top wicket takers' });
  }
});

// GET /api/stats/points-table/:tournamentId
router.get('/points-table/:tournamentId', async (req, res) => {
  try {
    const result = await query(`
      SELECT pt.*, t.name AS team_name, t.short_name, t.logo_url
      FROM points_table pt JOIN teams t ON pt.team_id = t.id
      WHERE pt.tournament_id = $1
      ORDER BY pt.points DESC, pt.net_run_rate DESC`, [req.params.tournamentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch points table' });
  }
});

// GET /api/stats/player/:playerId
router.get('/player/:playerId', async (req, res) => {
  try {
    const player = await query(`SELECT p.*, t.name AS team_name FROM players p
      LEFT JOIN teams t ON p.team_id = t.id WHERE p.id = $1`, [req.params.playerId]);
    if (player.rows.length === 0) return res.status(404).json({ error: 'Player not found' });

    const batting = await query(`SELECT COUNT(*) AS innings, SUM(runs_scored) AS total_runs,
      MAX(runs_scored) AS highest, ROUND(AVG(runs_scored),2) AS avg,
      SUM(fours) AS fours, SUM(sixes) AS sixes,
      ROUND(SUM(runs_scored)*100.0/NULLIF(SUM(balls_faced),0),2) AS sr
      FROM batting_scorecards WHERE player_id = $1`, [req.params.playerId]);

    const bowling = await query(`SELECT COUNT(*) AS innings, SUM(wickets) AS total_wickets,
      SUM(overs_bowled) AS total_overs, SUM(runs_conceded) AS runs_conceded,
      ROUND(AVG(economy_rate),2) AS economy
      FROM bowling_scorecards WHERE player_id = $1`, [req.params.playerId]);

    res.json({
      ...player.rows[0],
      batting_stats: batting.rows[0],
      bowling_stats: bowling.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// GET /api/stats/dashboard - Overview stats
router.get('/dashboard', async (req, res) => {
  try {
    const [teams, players, tournaments, matches] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM teams WHERE is_active=TRUE'),
      query('SELECT COUNT(*) AS count FROM players WHERE is_active=TRUE'),
      query('SELECT COUNT(*) AS count FROM tournaments'),
      query('SELECT COUNT(*) AS count FROM matches'),
    ]);
    const recentMatches = await query(`
      SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
      FROM matches m JOIN teams t1 ON m.team1_id=t1.id JOIN teams t2 ON m.team2_id=t2.id
      LEFT JOIN teams w ON m.winner_id=w.id
      ORDER BY m.match_date DESC LIMIT 5`);
    res.json({
      total_teams: parseInt(teams.rows[0].count),
      total_players: parseInt(players.rows[0].count),
      total_tournaments: parseInt(tournaments.rows[0].count),
      total_matches: parseInt(matches.rows[0].count),
      recent_matches: recentMatches.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;

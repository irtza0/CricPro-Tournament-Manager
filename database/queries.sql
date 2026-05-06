-- ============================================================
-- Sample Queries for Cricket Tournament Manager
-- ============================================================

-- 1. LEADERBOARD: Top Run Scorers across all matches
SELECT p.first_name || ' ' || p.last_name AS player_name,
       t.name AS team_name, p.role,
       COUNT(bs.id) AS innings, SUM(bs.runs_scored) AS total_runs,
       SUM(bs.balls_faced) AS total_balls, SUM(bs.fours) AS total_fours,
       SUM(bs.sixes) AS total_sixes,
       ROUND(AVG(bs.runs_scored), 2) AS batting_avg,
       ROUND(SUM(bs.runs_scored) * 100.0 / NULLIF(SUM(bs.balls_faced), 0), 2) AS strike_rate
FROM batting_scorecards bs
JOIN players p ON bs.player_id = p.id
JOIN teams t ON bs.team_id = t.id
GROUP BY p.id, p.first_name, p.last_name, t.name, p.role
ORDER BY total_runs DESC LIMIT 10;

-- 2. LEADERBOARD: Top Wicket Takers
SELECT p.first_name || ' ' || p.last_name AS player_name,
       t.name AS team_name,
       COUNT(bw.id) AS innings, SUM(bw.wickets) AS total_wickets,
       SUM(bw.overs_bowled) AS total_overs,
       SUM(bw.runs_conceded) AS runs_conceded,
       ROUND(AVG(bw.economy_rate), 2) AS avg_economy,
       ROUND(SUM(bw.runs_conceded) / NULLIF(SUM(bw.wickets), 0), 2) AS bowling_avg
FROM bowling_scorecards bw
JOIN players p ON bw.player_id = p.id
JOIN teams t ON bw.team_id = t.id
GROUP BY p.id, p.first_name, p.last_name, t.name
ORDER BY total_wickets DESC LIMIT 10;

-- 3. POINTS TABLE for a tournament
SELECT t.name AS team_name, t.short_name,
       pt.matches_played, pt.wins, pt.losses, pt.draws, pt.no_results,
       pt.points, pt.net_run_rate
FROM points_table pt
JOIN teams t ON pt.team_id = t.id
WHERE pt.tournament_id = $1
ORDER BY pt.points DESC, pt.net_run_rate DESC;

-- 4. Match details with team names
SELECT m.id, m.match_date, m.venue, m.match_type, m.status,
       t1.name AS team1, t2.name AS team2,
       w.name AS winner, m.result_summary
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
LEFT JOIN teams w ON m.winner_id = w.id
WHERE m.tournament_id = $1
ORDER BY m.match_date;

-- 5. Full scorecard for a match
SELECT p.first_name || ' ' || p.last_name AS batsman,
       bs.runs_scored, bs.balls_faced, bs.fours, bs.sixes,
       bs.strike_rate, bs.dismissal_type,
       t.name AS team_name
FROM batting_scorecards bs
JOIN players p ON bs.player_id = p.id
JOIN teams t ON bs.team_id = t.id
WHERE bs.match_id = $1
ORDER BY t.id, bs.batting_order;

-- 6. Player career statistics
SELECT p.first_name || ' ' || p.last_name AS player_name,
       COUNT(DISTINCT bs.match_id) AS matches,
       SUM(bs.runs_scored) AS total_runs,
       MAX(bs.runs_scored) AS highest_score,
       ROUND(AVG(bs.runs_scored), 2) AS avg,
       SUM(bs.fours) AS fours, SUM(bs.sixes) AS sixes
FROM players p
LEFT JOIN batting_scorecards bs ON p.id = bs.player_id
WHERE p.id = $1
GROUP BY p.id, p.first_name, p.last_name;

-- 7. Team roster
SELECT p.first_name || ' ' || p.last_name AS name,
       p.role, p.batting_style, p.bowling_style, p.jersey_number
FROM players p WHERE p.team_id = $1 AND p.is_active = TRUE
ORDER BY p.jersey_number;

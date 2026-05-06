-- Seed Data for Cricket Tournament Manager
-- Password for all users: password123

INSERT INTO users (id, username, email, password_hash, full_name, role) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', 'admin@cricket.com', '$2a$10$zXYqCvKAAj8BJNfv.iYQWeHA0iF.i..Kj.XfGu1Vz/u.XREClb4xq', 'System Admin', 'admin'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'virat_mgr', 'virat@cricket.com', '$2a$10$zXYqCvKAAj8BJNfv.iYQWeHA0iF.i..Kj.XfGu1Vz/u.XREClb4xq', 'Virat Manager', 'team_manager'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'dhoni_mgr', 'dhoni@cricket.com', '$2a$10$zXYqCvKAAj8BJNfv.iYQWeHA0iF.i..Kj.XfGu1Vz/u.XREClb4xq', 'MS Dhoni Mgr', 'team_manager'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'fan_user', 'fan@cricket.com', '$2a$10$zXYqCvKAAj8BJNfv.iYQWeHA0iF.i..Kj.XfGu1Vz/u.XREClb4xq', 'Cricket Fan', 'fan');

INSERT INTO tournaments (id, name, format, start_date, end_date, venue, status, max_teams, created_by) VALUES
('10000001-0000-0000-0000-000000000001', 'Premier Cricket League 2026', 'T20', '2026-06-01', '2026-07-15', 'National Stadium', 'upcoming', 8, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

INSERT INTO teams (id, name, short_name, home_ground, founded_year, manager_id) VALUES
('20000001-0000-0000-0000-000000000001', 'Royal Challengers', 'RCH', 'Eden Gardens', 2018, 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('20000001-0000-0000-0000-000000000002', 'Super Kings', 'SK', 'Chepauk Stadium', 2015, 'c3d4e5f6-a7b8-9012-cdef-123456789012'),
('20000001-0000-0000-0000-000000000003', 'Thunder Strikers', 'TS', 'Wankhede Stadium', 2019, NULL),
('20000001-0000-0000-0000-000000000004', 'Storm Warriors', 'SW', 'Chinnaswamy', 2020, NULL);

INSERT INTO players (id, first_name, last_name, nationality, role, batting_style, bowling_style, jersey_number, team_id) VALUES
('30000001-0000-0000-0000-000000000001', 'Arjun', 'Sharma', 'India', 'batsman', 'right_hand', 'none', 18, '20000001-0000-0000-0000-000000000001'),
('30000001-0000-0000-0000-000000000002', 'Rahul', 'Patel', 'India', 'bowler', 'right_hand', 'right_arm_fast', 45, '20000001-0000-0000-0000-000000000001'),
('30000001-0000-0000-0000-000000000003', 'James', 'Anderson', 'England', 'all_rounder', 'left_hand', 'left_arm_fast', 7, '20000001-0000-0000-0000-000000000001'),
('30000001-0000-0000-0000-000000000004', 'Rohit', 'Verma', 'India', 'batsman', 'right_hand', 'right_arm_medium', 10, '20000001-0000-0000-0000-000000000002'),
('30000001-0000-0000-0000-000000000005', 'Mitchell', 'Johnson', 'Australia', 'bowler', 'left_hand', 'left_arm_fast', 99, '20000001-0000-0000-0000-000000000002'),
('30000001-0000-0000-0000-000000000006', 'Vikram', 'Rathore', 'India', 'batsman', 'right_hand', 'right_arm_medium', 8, '20000001-0000-0000-0000-000000000003');

INSERT INTO tournament_teams (tournament_id, team_id, group_name, seed_number) VALUES
('10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000001', 'A', 1),
('10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000002', 'A', 2),
('10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000003', 'B', 3),
('10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000004', 'B', 4);

INSERT INTO matches (id, tournament_id, team1_id, team2_id, match_date, venue, match_type, status, winner_id, result_summary, overs) VALUES
('40000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000002', '2026-06-01 14:00:00+05:30', 'Eden Gardens', 'group', 'completed', '20000001-0000-0000-0000-000000000001', 'Royal Challengers won by 25 runs', 20);

-- Innings for the completed match
INSERT INTO match_innings (match_id, batting_team_id, bowling_team_id, innings_number, total_runs, total_wickets, total_overs, extras) VALUES
('40000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000002', 1, 185, 6, 20.0, 12),
('40000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000002', '20000001-0000-0000-0000-000000000001', 2, 160, 8, 20.0, 8);

-- Batting scorecards - Royal Challengers innings
INSERT INTO batting_scorecards (match_id, player_id, team_id, batting_order, runs_scored, balls_faced, fours, sixes, is_out, dismissal_type) VALUES
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000001', 1, 78, 52, 8, 3, true, 'caught'),
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000002', '20000001-0000-0000-0000-000000000001', 2, 15, 12, 2, 0, true, 'bowled'),
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000003', '20000001-0000-0000-0000-000000000001', 3, 62, 38, 5, 4, false, 'not_out');

-- Batting scorecards - Super Kings innings
INSERT INTO batting_scorecards (match_id, player_id, team_id, batting_order, runs_scored, balls_faced, fours, sixes, is_out, dismissal_type) VALUES
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000004', '20000001-0000-0000-0000-000000000002', 1, 45, 35, 4, 2, true, 'caught'),
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000005', '20000001-0000-0000-0000-000000000002', 2, 22, 20, 3, 0, true, 'lbw');

-- Bowling scorecards
INSERT INTO bowling_scorecards (match_id, player_id, team_id, overs_bowled, maidens, runs_conceded, wickets, no_balls, wides) VALUES
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000002', '20000001-0000-0000-0000-000000000001', 4.0, 0, 32, 2, 0, 1),
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000003', '20000001-0000-0000-0000-000000000001', 4.0, 1, 28, 3, 0, 0),
('40000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000005', '20000001-0000-0000-0000-000000000002', 4.0, 0, 45, 1, 1, 2);

INSERT INTO points_table (tournament_id, team_id, matches_played, wins, losses, points, net_run_rate) VALUES
('10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000001', 1, 1, 0, 2, 1.250),
('10000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000002', 1, 0, 1, 0, -1.250);

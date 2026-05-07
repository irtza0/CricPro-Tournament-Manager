-- Author: Muhammad Zeeshan Nasim (Reg No: 2024495)
-- ============================================================
-- 🏏 Cricket Tournament & Statistics Manager
-- Agent 1: Database Architect — Complete PostgreSQL Schema
-- ============================================================
-- Normalized to 3NF with proper constraints and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- Stores all system users with role-based access
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'fan' 
                    CHECK (role IN ('admin', 'team_manager', 'fan')),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: tournaments
-- Manages cricket tournaments/leagues
-- ============================================================
CREATE TABLE tournaments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    format          VARCHAR(30) NOT NULL 
                    CHECK (format IN ('T20', 'ODI', 'Test', 'T10', 'The Hundred')),
    start_date      DATE NOT NULL,
    end_date        DATE,
    venue           VARCHAR(200),
    status          VARCHAR(20) DEFAULT 'upcoming' 
                    CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    description     TEXT,
    max_teams       INTEGER DEFAULT 8,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: teams
-- Cricket teams participating in tournaments
-- ============================================================
CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    short_name      VARCHAR(10) NOT NULL,
    logo_url        VARCHAR(500),
    home_ground     VARCHAR(200),
    founded_year    INTEGER,
    manager_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: players
-- Individual cricket players belonging to teams
-- ============================================================
CREATE TABLE players (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    date_of_birth   DATE,
    nationality     VARCHAR(50),
    role            VARCHAR(30) NOT NULL 
                    CHECK (role IN ('batsman', 'bowler', 'all_rounder', 'wicket_keeper')),
    batting_style   VARCHAR(20) 
                    CHECK (batting_style IN ('right_hand', 'left_hand')),
    bowling_style   VARCHAR(30) 
                    CHECK (bowling_style IN ('right_arm_fast', 'left_arm_fast', 
                           'right_arm_medium', 'left_arm_medium',
                           'right_arm_spin', 'left_arm_spin', 'none')),
    jersey_number   INTEGER,
    team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: tournament_teams (Junction table)
-- Many-to-many relationship between tournaments and teams
-- ============================================================
CREATE TABLE tournament_teams (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    group_name      VARCHAR(20),
    seed_number     INTEGER,
    registered_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

-- ============================================================
-- TABLE: matches
-- Cricket matches within tournaments
-- ============================================================
CREATE TABLE matches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team1_id        UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team2_id        UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date      TIMESTAMP WITH TIME ZONE NOT NULL,
    venue           VARCHAR(200),
    match_type      VARCHAR(20) NOT NULL 
                    CHECK (match_type IN ('group', 'quarter_final', 'semi_final', 
                           'final', 'playoff', 'friendly')),
    status          VARCHAR(20) DEFAULT 'scheduled' 
                    CHECK (status IN ('scheduled', 'live', 'completed', 'abandoned', 'postponed')),
    toss_winner_id  UUID REFERENCES teams(id),
    toss_decision   VARCHAR(10) CHECK (toss_decision IN ('bat', 'bowl')),
    winner_id       UUID REFERENCES teams(id),
    result_summary  VARCHAR(300),
    overs           INTEGER DEFAULT 20,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (team1_id != team2_id)
);

-- ============================================================
-- TABLE: scorecards (Batting)
-- Individual batting performance per match
-- ============================================================
CREATE TABLE batting_scorecards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    batting_order   INTEGER,
    runs_scored     INTEGER DEFAULT 0 CHECK (runs_scored >= 0),
    balls_faced     INTEGER DEFAULT 0 CHECK (balls_faced >= 0),
    fours           INTEGER DEFAULT 0 CHECK (fours >= 0),
    sixes           INTEGER DEFAULT 0 CHECK (sixes >= 0),
    is_out          BOOLEAN DEFAULT FALSE,
    dismissal_type  VARCHAR(30) 
                    CHECK (dismissal_type IN ('bowled', 'caught', 'lbw', 'run_out', 
                           'stumped', 'hit_wicket', 'retired_hurt', 'not_out', NULL)),
    bowler_id       UUID REFERENCES players(id),
    fielder_id      UUID REFERENCES players(id),
    strike_rate     DECIMAL(6,2) GENERATED ALWAYS AS (
                    CASE WHEN balls_faced > 0 THEN (runs_scored * 100.0 / balls_faced) 
                    ELSE 0 END) STORED,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- ============================================================
-- TABLE: bowling_scorecards
-- Individual bowling performance per match
-- ============================================================
CREATE TABLE bowling_scorecards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    overs_bowled    DECIMAL(4,1) DEFAULT 0 CHECK (overs_bowled >= 0),
    maidens         INTEGER DEFAULT 0 CHECK (maidens >= 0),
    runs_conceded   INTEGER DEFAULT 0 CHECK (runs_conceded >= 0),
    wickets         INTEGER DEFAULT 0 CHECK (wickets >= 0),
    no_balls        INTEGER DEFAULT 0 CHECK (no_balls >= 0),
    wides           INTEGER DEFAULT 0 CHECK (wides >= 0),
    economy_rate    DECIMAL(5,2) GENERATED ALWAYS AS (
                    CASE WHEN overs_bowled > 0 THEN (runs_conceded / overs_bowled) 
                    ELSE 0 END) STORED,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- ============================================================
-- TABLE: match_innings
-- Summary of each innings in a match
-- ============================================================
CREATE TABLE match_innings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    batting_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    bowling_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    innings_number  INTEGER NOT NULL CHECK (innings_number IN (1, 2)),
    total_runs      INTEGER DEFAULT 0 CHECK (total_runs >= 0),
    total_wickets   INTEGER DEFAULT 0 CHECK (total_wickets >= 0 AND total_wickets <= 10),
    total_overs     DECIMAL(4,1) DEFAULT 0,
    extras          INTEGER DEFAULT 0 CHECK (extras >= 0),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, innings_number)
);

-- ============================================================
-- TABLE: points_table
-- Tournament standings
-- ============================================================
CREATE TABLE points_table (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    matches_played  INTEGER DEFAULT 0,
    wins            INTEGER DEFAULT 0,
    losses          INTEGER DEFAULT 0,
    draws           INTEGER DEFAULT 0,
    no_results      INTEGER DEFAULT 0,
    points          INTEGER DEFAULT 0,
    net_run_rate    DECIMAL(6,3) DEFAULT 0.000,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

-- ============================================================
-- INDEXES for performance optimization
-- ============================================================
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_teams ON matches(team1_id, team2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_batting_match ON batting_scorecards(match_id);
CREATE INDEX idx_batting_player ON batting_scorecards(player_id);
CREATE INDEX idx_bowling_match ON bowling_scorecards(match_id);
CREATE INDEX idx_bowling_player ON bowling_scorecards(player_id);
CREATE INDEX idx_points_tournament ON points_table(tournament_id);
CREATE INDEX idx_tournament_teams_tournament ON tournament_teams(tournament_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_timestamp BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_timestamp BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_timestamp BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_timestamp BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

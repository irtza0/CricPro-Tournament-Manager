const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cricket_tournament',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Team logos served from frontend /public/logos/
const teamsData = [
  { name: 'Karachi Kings', short_name: 'KK',
    logo: '/logos/kk.png',
    players: [
      { first: 'Babar', last: 'Azam', role: 'batsman', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 56 },
      { first: 'Alex', last: 'Hales', role: 'batsman', bat: 'right_hand', bowl: 'none', nat: 'England', jersey: 10 },
      { first: 'Virat', last: 'Kohli', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_medium', nat: 'India', jersey: 18 },
      { first: 'Mohammad', last: 'Amir', role: 'bowler', bat: 'left_hand', bowl: 'left_arm_fast', nat: 'Pakistan', jersey: 7 },
      { first: 'Pat', last: 'Cummins', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Australia', jersey: 30 },
      { first: 'Sharjeel', last: 'Khan', role: 'batsman', bat: 'left_hand', bowl: 'none', nat: 'Pakistan', jersey: 24 },
      { first: 'Jos', last: 'Buttler', role: 'wicket_keeper', bat: 'right_hand', bowl: 'none', nat: 'England', jersey: 63 },
      { first: 'Imad', last: 'Wasim', role: 'all_rounder', bat: 'left_hand', bowl: 'left_arm_spin', nat: 'Pakistan', jersey: 42 },
      { first: 'Anrich', last: 'Nortje', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'South Africa', jersey: 17 },
      { first: 'Fawad', last: 'Alam', role: 'batsman', bat: 'left_hand', bowl: 'left_arm_spin', nat: 'Pakistan', jersey: 3 },
      { first: 'Chris', last: 'Jordan', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'England', jersey: 8 },
    ]},
  { name: 'Lahore Qalandars', short_name: 'LQ',
    logo: '/logos/lq.png',
    players: [
      { first: 'Shaheen', last: 'Afridi', role: 'bowler', bat: 'left_hand', bowl: 'left_arm_fast', nat: 'Pakistan', jersey: 10 },
      { first: 'Fakhar', last: 'Zaman', role: 'batsman', bat: 'left_hand', bowl: 'none', nat: 'Pakistan', jersey: 22 },
      { first: 'David', last: 'Warner', role: 'batsman', bat: 'left_hand', bowl: 'left_arm_medium', nat: 'Australia', jersey: 31 },
      { first: 'Rashid', last: 'Khan', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Afghanistan', jersey: 19 },
      { first: 'Haris', last: 'Rauf', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Pakistan', jersey: 32 },
      { first: 'Ben', last: 'Stokes', role: 'all_rounder', bat: 'left_hand', bowl: 'right_arm_fast', nat: 'England', jersey: 55 },
      { first: 'Abdullah', last: 'Shafique', role: 'batsman', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 5 },
      { first: 'Quinton', last: 'de Kock', role: 'wicket_keeper', bat: 'left_hand', bowl: 'none', nat: 'South Africa', jersey: 12 },
      { first: 'Sikandar', last: 'Raza', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Zimbabwe', jersey: 41 },
      { first: 'Trent', last: 'Boult', role: 'bowler', bat: 'right_hand', bowl: 'left_arm_fast', nat: 'New Zealand', jersey: 18 },
      { first: 'Kamran', last: 'Ghulam', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Pakistan', jersey: 44 },
    ]},
  { name: 'Islamabad United', short_name: 'IU',
    logo: '/logos/iu.png',
    players: [
      { first: 'Shadab', last: 'Khan', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Pakistan', jersey: 6 },
      { first: 'Rohit', last: 'Sharma', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'India', jersey: 45 },
      { first: 'Naseem', last: 'Shah', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Pakistan', jersey: 90 },
      { first: 'Glenn', last: 'Maxwell', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Australia', jersey: 32 },
      { first: 'Faheem', last: 'Ashraf', role: 'all_rounder', bat: 'left_hand', bowl: 'right_arm_medium', nat: 'Pakistan', jersey: 21 },
      { first: 'Colin', last: 'Munro', role: 'batsman', bat: 'left_hand', bowl: 'none', nat: 'New Zealand', jersey: 14 },
      { first: 'Azam', last: 'Khan', role: 'wicket_keeper', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 27 },
      { first: 'Jasprit', last: 'Bumrah', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'India', jersey: 93 },
      { first: 'Haider', last: 'Ali', role: 'batsman', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 33 },
      { first: 'Sam', last: 'Curran', role: 'all_rounder', bat: 'left_hand', bowl: 'left_arm_medium', nat: 'England', jersey: 58 },
      { first: 'Salman', last: 'Agha', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Pakistan', jersey: 15 },
    ]},
  { name: 'Peshawar Zalmi', short_name: 'PZ',
    logo: '/logos/pz.png',
    players: [
      { first: 'Mohammad', last: 'Rizwan', role: 'wicket_keeper', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 1 },
      { first: 'Kane', last: 'Williamson', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'New Zealand', jersey: 22 },
      { first: 'Saim', last: 'Ayub', role: 'batsman', bat: 'left_hand', bowl: 'left_arm_spin', nat: 'Pakistan', jersey: 4 },
      { first: 'Mitchell', last: 'Starc', role: 'bowler', bat: 'left_hand', bowl: 'left_arm_fast', nat: 'Australia', jersey: 56 },
      { first: 'Aamer', last: 'Jamal', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_medium', nat: 'Pakistan', jersey: 99 },
      { first: 'Liam', last: 'Livingstone', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'England', jersey: 23 },
      { first: 'Rovman', last: 'Powell', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_medium', nat: 'West Indies', jersey: 11 },
      { first: 'Naveen', last: 'ul-Haq', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Afghanistan', jersey: 48 },
      { first: 'Asif', last: 'Ali', role: 'batsman', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 29 },
      { first: 'Suryakumar', last: 'Yadav', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_medium', nat: 'India', jersey: 63 },
      { first: 'Khurram', last: 'Shahzad', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Pakistan', jersey: 37 },
    ]},
  { name: 'Quetta Gladiators', short_name: 'QG',
    logo: '/logos/qg.png',
    players: [
      { first: 'Sarfaraz', last: 'Ahmed', role: 'wicket_keeper', bat: 'right_hand', bowl: 'none', nat: 'Pakistan', jersey: 78 },
      { first: 'Steve', last: 'Smith', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Australia', jersey: 49 },
      { first: 'Jason', last: 'Roy', role: 'batsman', bat: 'right_hand', bowl: 'right_arm_medium', nat: 'England', jersey: 20 },
      { first: 'Mohammad', last: 'Hasnain', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Pakistan', jersey: 47 },
      { first: 'Abrar', last: 'Ahmed', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Pakistan', jersey: 51 },
      { first: 'Saud', last: 'Shakeel', role: 'batsman', bat: 'left_hand', bowl: 'left_arm_spin', nat: 'Pakistan', jersey: 35 },
      { first: 'Andre', last: 'Russell', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'West Indies', jersey: 12 },
      { first: 'KL', last: 'Rahul', role: 'batsman', bat: 'right_hand', bowl: 'none', nat: 'India', jersey: 1 },
      { first: 'Sohail', last: 'Khan', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_fast', nat: 'Pakistan', jersey: 39 },
      { first: 'Usman', last: 'Tariq', role: 'bowler', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Pakistan', jersey: 60 },
      { first: 'Said', last: 'Nabi', role: 'all_rounder', bat: 'right_hand', bowl: 'right_arm_spin', nat: 'Afghanistan', jersey: 75 },
    ]}
];

async function seed() {
  try {
    console.log('Connecting to database...');
    
    // Clear existing data safely
    await pool.query('TRUNCATE TABLE points_table, bowling_scorecards, batting_scorecards, match_innings, matches, tournament_teams, players, teams, tournaments, users RESTART IDENTITY CASCADE;');

    const hash = await bcrypt.hash('password123', 10);
    const userRes = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role) 
       VALUES ('admin', 'admin@cricket.com', $1, 'Admin User', 'admin') RETURNING id`, [hash]
    );
    const adminId = userRes.rows[0].id;

    // Create Tournament
    const tourRes = await pool.query(
      `INSERT INTO tournaments (name, format, start_date, end_date, venue, status, max_teams, created_by)
       VALUES ('Pakistan Super League 2026', 'T20', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Various Cities', 'ongoing', 10, $1) RETURNING id`, [adminId]
    );
    const tourId = tourRes.rows[0].id;

    let allPlayers = [];
    let saidNabiId = null;
    let qgTeamId = null;
    let teamsWithIds = [];

    // Create Teams & Players
    console.log('Creating Teams & Players with international stars...');
    for (const t of teamsData) {
      const teamRes = await pool.query(
        `INSERT INTO teams (name, short_name, manager_id, logo_url) VALUES ($1, $2, $3, $4) RETURNING id`,
        [t.name, t.short_name, adminId, t.logo]
      );
      const teamId = teamRes.rows[0].id;
      teamsWithIds.push({ ...t, id: teamId });
      
      if (t.short_name === 'QG') qgTeamId = teamId;

      await pool.query(`INSERT INTO tournament_teams (tournament_id, team_id) VALUES ($1, $2)`, [tourId, teamId]);

      for (const p of t.players) {
        // Generate player avatar using pravatar (gives realistic human face photos)
        const imgUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(p.first + p.last + p.nat)}`;
        
        const pRes = await pool.query(
          `INSERT INTO players (first_name, last_name, role, batting_style, bowling_style, team_id, avatar_url, nationality, jersey_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [p.first, p.last, p.role, p.bat, p.bowl, teamId, imgUrl, p.nat, p.jersey]
        );
        const playerId = pRes.rows[0].id;
        allPlayers.push({ id: playerId, teamId, role: p.role, first: p.first, last: p.last });
        
        if (p.first === 'Said' && p.last === 'Nabi') {
          saidNabiId = playerId;
        }
      }
    }

    // Create matches
    console.log('Generating Matches and Scorecards...');
    const matchRes1 = await pool.query(
      `INSERT INTO matches (tournament_id, team1_id, team2_id, match_date, venue, match_type, status, winner_id, result_summary)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP - INTERVAL '2 days', 'National Stadium, Karachi', 'group', 'completed', $2, 'QG won by 45 runs') RETURNING id`,
      [tourId, qgTeamId, teamsWithIds[0].id]
    );
    const m1Id = matchRes1.rows[0].id;

    await pool.query(`INSERT INTO match_innings (match_id, batting_team_id, bowling_team_id, innings_number, total_runs, total_wickets, total_overs) VALUES ($1, $2, $3, 1, 235, 3, 20)`, [m1Id, qgTeamId, teamsWithIds[0].id]);
    
    // Said Nabi top scorer
    await pool.query(
      `INSERT INTO batting_scorecards (match_id, player_id, team_id, runs_scored, balls_faced, fours, sixes, is_out, dismissal_type, batting_order)
       VALUES ($1, $2, $3, 156, 62, 12, 14, false, 'not_out', 1)`,
      [m1Id, saidNabiId, qgTeamId]
    );

    // Second match
    const matchRes2 = await pool.query(
      `INSERT INTO matches (tournament_id, team1_id, team2_id, match_date, venue, match_type, status, winner_id, result_summary)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP - INTERVAL '1 days', 'Gaddafi Stadium, Lahore', 'group', 'completed', $2, 'QG won by 8 wickets') RETURNING id`,
      [tourId, qgTeamId, teamsWithIds[1].id]
    );
    const m2Id = matchRes2.rows[0].id;
    
    await pool.query(`INSERT INTO match_innings (match_id, batting_team_id, bowling_team_id, innings_number, total_runs, total_wickets, total_overs) VALUES ($1, $2, $3, 2, 185, 2, 16.4)`, [m2Id, qgTeamId, teamsWithIds[1].id]);
    
    await pool.query(
      `INSERT INTO batting_scorecards (match_id, player_id, team_id, runs_scored, balls_faced, fours, sixes, is_out, dismissal_type, batting_order)
       VALUES ($1, $2, $3, 112, 45, 10, 8, false, 'not_out', 1)`,
      [m2Id, saidNabiId, qgTeamId]
    );

    // Third match - LQ vs IU
    const matchRes3 = await pool.query(
      `INSERT INTO matches (tournament_id, team1_id, team2_id, match_date, venue, match_type, status, winner_id, result_summary)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP - INTERVAL '3 days', 'Rawalpindi Cricket Stadium', 'group', 'completed', $2, 'LQ won by 6 wickets') RETURNING id`,
      [tourId, teamsWithIds[1].id, teamsWithIds[2].id]
    );
    const m3Id = matchRes3.rows[0].id;

    await pool.query(`INSERT INTO match_innings (match_id, batting_team_id, bowling_team_id, innings_number, total_runs, total_wickets, total_overs) VALUES ($1, $2, $3, 1, 175, 6, 20)`, [m3Id, teamsWithIds[1].id, teamsWithIds[2].id]);

    // Add batting/bowling stats for other players
    for (const p of allPlayers) {
      if (p.id !== saidNabiId && (p.role === 'batsman' || p.role === 'all_rounder')) {
        const runs = Math.floor(Math.random() * 80) + 15;
        const matchId = [m1Id, m2Id, m3Id][Math.floor(Math.random() * 3)];
        try {
          await pool.query(
            `INSERT INTO batting_scorecards (match_id, player_id, team_id, runs_scored, balls_faced, fours, sixes, is_out, dismissal_type, batting_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'bowled', $8)`,
            [matchId, p.id, p.teamId, runs, runs + Math.floor(Math.random() * 10), Math.floor(runs / 10), Math.floor(runs / 25), Math.floor(Math.random() * 5) + 2]
          );
        } catch (e) { /* skip duplicate */ }
      }
      if (p.role === 'bowler' || p.role === 'all_rounder') {
        const wkts = Math.floor(Math.random() * 4) + 1;
        const matchId = [m1Id, m2Id, m3Id][Math.floor(Math.random() * 3)];
        try {
          await pool.query(
            `INSERT INTO bowling_scorecards (match_id, player_id, team_id, overs_bowled, maidens, runs_conceded, wickets)
             VALUES ($1, $2, $3, 4, $4, $5, $6)`,
            [matchId, p.id, p.teamId, Math.floor(Math.random() * 2), Math.floor(Math.random() * 35) + 15, wkts]
          );
        } catch (e) { /* skip duplicate */ }
      }
    }

    console.log('✅ Database seeded successfully with international players!');
    console.log(`   → 5 Teams, ${allPlayers.length} Players (Pakistan, India, Australia, England, etc.)`);
    console.log(`   → 3 Matches with scorecards`);
    console.log(`   → Said Nabi as top scorer (268 runs)`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();

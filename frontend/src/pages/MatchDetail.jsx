import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchesAPI } from '../services/api';

const TEAM_LOGOS = {
  'Royal Challengers': '/images/team-rch.png', 'Super Kings': '/images/team-sk.png',
  'Thunder Strikers': '/images/team-ts.png', 'Storm Warriors': '/images/team-sw.png',
};

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { matchesAPI.getById(id).then(r => setMatch(r.data)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!match) return <div className="text-center py-12 text-surface-400">Match not found</div>;

  const team1Batting = match.batting_scorecard?.filter(b => b.team_id === match.team1_id) || [];
  const team2Batting = match.batting_scorecard?.filter(b => b.team_id === match.team2_id) || [];
  const team1Bowling = match.bowling_scorecard?.filter(b => b.team_id === match.team1_id) || [];
  const team2Bowling = match.bowling_scorecard?.filter(b => b.team_id === match.team2_id) || [];

  const BattingTable = ({ entries, teamName }) => (
    <div className="glass-card p-6 mb-4">
      <h3 className="section-title mb-4">{teamName} — Batting</h3>
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2.5 text-left">Batsman</th><th className="px-3 py-2.5 text-center">R</th>
              <th className="px-3 py-2.5 text-center">B</th><th className="px-3 py-2.5 text-center">4s</th>
              <th className="px-3 py-2.5 text-center">6s</th><th className="px-3 py-2.5 text-center">SR</th>
              <th className="px-3 py-2.5 text-left">Dismissal</th>
            </tr></thead>
            <tbody>
              {entries.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-white">{b.first_name} {b.last_name}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-primary-400">{b.runs_scored}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.balls_faced}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.fours}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.sixes}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.strike_rate}</td>
                  <td className="px-3 py-2.5 text-surface-500 capitalize text-xs">{b.dismissal_type?.replace('_', ' ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-surface-500 text-center py-6">No batting data</p>}
    </div>
  );

  const BowlingTable = ({ entries, teamName }) => (
    <div className="glass-card p-6 mb-4">
      <h3 className="section-title mb-4">{teamName} — Bowling</h3>
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2.5 text-left">Bowler</th><th className="px-3 py-2.5 text-center">O</th>
              <th className="px-3 py-2.5 text-center">M</th><th className="px-3 py-2.5 text-center">R</th>
              <th className="px-3 py-2.5 text-center">W</th><th className="px-3 py-2.5 text-center">Econ</th>
            </tr></thead>
            <tbody>
              {entries.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-white">{b.first_name} {b.last_name}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.overs_bowled}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.maidens}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.runs_conceded}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-accent-400">{b.wickets}</td>
                  <td className="px-3 py-2.5 text-center text-surface-400">{b.economy_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-surface-500 text-center py-6">No bowling data</p>}
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Matches
      </Link>

      {/* Match Header */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.03] to-accent-500/[0.03]" />
        <div className="relative text-center">
          <p className="text-sm text-surface-500 mb-6">
            {match.tournament_name} &middot; {match.match_type?.replace('_', ' ')} &middot; {match.venue}
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="team-logo w-16 h-16 mx-auto mb-3 rounded-2xl">
                {TEAM_LOGOS[match.team1_name] ?
                  <img src={TEAM_LOGOS[match.team1_name]} alt={match.team1_name} /> :
                  <span className="text-xl font-bold text-primary-400">{match.team1_name?.[0]}</span>}
              </div>
              <p className="text-xl font-bold text-white font-display">{match.team1_name}</p>
              {match.innings?.[0] && (
                <p className="text-3xl font-bold text-primary-400 mt-2 font-display">
                  {match.innings[0].total_runs}/{match.innings[0].total_wickets}
                  <span className="text-sm text-surface-500 font-normal ml-1">({match.innings[0].total_overs} ov)</span>
                </p>
              )}
            </div>
            <div className="vs-badge text-lg font-bold">VS</div>
            <div className="text-center">
              <div className="team-logo w-16 h-16 mx-auto mb-3 rounded-2xl">
                {TEAM_LOGOS[match.team2_name] ?
                  <img src={TEAM_LOGOS[match.team2_name]} alt={match.team2_name} /> :
                  <span className="text-xl font-bold text-primary-400">{match.team2_name?.[0]}</span>}
              </div>
              <p className="text-xl font-bold text-white font-display">{match.team2_name}</p>
              {match.innings?.[1] && (
                <p className="text-3xl font-bold text-primary-400 mt-2 font-display">
                  {match.innings[1].total_runs}/{match.innings[1].total_wickets}
                  <span className="text-sm text-surface-500 font-normal ml-1">({match.innings[1].total_overs} ov)</span>
                </p>
              )}
            </div>
          </div>
          {match.result_summary && <p className="mt-5 text-primary-400 font-semibold text-lg">{match.result_summary}</p>}
          <p className="text-xs text-surface-500 mt-2">{new Date(match.match_date).toLocaleString()}</p>
        </div>
      </div>

      {/* Scorecards */}
      <BattingTable entries={team1Batting} teamName={match.team1_name} />
      <BowlingTable entries={team2Bowling} teamName={match.team2_name} />
      <BattingTable entries={team2Batting} teamName={match.team2_name} />
      <BowlingTable entries={team1Bowling} teamName={match.team1_name} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { statsAPI, tournamentsAPI } from '../services/api';

export default function Leaderboard() {
  const [tab, setTab] = useState('batting');
  const [topScorers, setTopScorers] = useState([]);
  const [topWickets, setTopWickets] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { tournamentsAPI.getAll().then(r => setTournaments(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedTournament ? { tournament_id: selectedTournament } : {};
    Promise.all([
      statsAPI.topScorers(params),
      statsAPI.topWicketTakers(params),
    ]).then(([scorers, wickets]) => {
      setTopScorers(scorers.data);
      setTopWickets(wickets.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedTournament]);

  const getMedalStyle = (i) => {
    if (i === 0) return 'bg-amber-400/15 text-amber-400 border-amber-400/25';
    if (i === 1) return 'bg-gray-300/10 text-gray-300 border-gray-300/20';
    if (i === 2) return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
    return 'text-surface-500';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
          <h1 className="page-title">Leaderboard</h1>
        </div>
        <p className="page-subtitle ml-5">Top performers across all matches</p>
      </div>

      {/* Tournament Filter */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="select-field max-w-[300px]">
          <option value="">All Tournaments</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-surface-900/60 rounded-xl p-1.5 border border-surface-700/20">
        {['batting', 'bowling'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all flex-1 flex items-center justify-center gap-2
            ${tab === t ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-surface-500 hover:text-white border border-transparent'}`}>
            {t === 'batting' ? (
              <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/><rect x="14" y="2" width="5" height="5" rx="1"/></svg> Top Run Scorers</>
            ) : (
              <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> Top Wicket Takers</>
            )}
          </button>
        ))}
      </div>

      {/* Batting Leaderboard */}
      {tab === 'batting' && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3.5 text-left w-12">#</th><th className="px-4 py-3.5 text-left">Player</th>
              <th className="px-4 py-3.5 text-left">Team</th><th className="px-4 py-3.5 text-center">Inn</th>
              <th className="px-4 py-3.5 text-center">Runs</th><th className="px-4 py-3.5 text-center">HS</th>
              <th className="px-4 py-3.5 text-center">Avg</th><th className="px-4 py-3.5 text-center">SR</th>
              <th className="px-4 py-3.5 text-center">4s</th><th className="px-4 py-3.5 text-center">6s</th>
            </tr></thead>
            <tbody>
              {topScorers.map((p, i) => (
                <tr key={p.id} className={`table-row ${i < 3 ? 'bg-primary-500/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5">
                    {i < 3 ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${getMedalStyle(i)}`}>{i + 1}</span>
                    ) : <span className="text-surface-500 font-medium ml-1">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="player-avatar w-9 h-9 text-xs font-bold text-white">{p.player_name?.split(' ').map(n=>n[0]).join('')}</div>
                      <span className="font-semibold text-white">{p.player_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-surface-400">{p.short_name}</td>
                  <td className="px-4 py-3.5 text-center text-surface-400">{p.innings}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-primary-400 text-lg">{p.total_runs}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.highest_score || '—'}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.batting_avg}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.strike_rate}</td>
                  <td className="px-4 py-3.5 text-center text-surface-400">{p.total_fours}</td>
                  <td className="px-4 py-3.5 text-center text-surface-400">{p.total_sixes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topScorers.length === 0 && <p className="text-surface-500 text-center py-10">No batting data available</p>}
        </div>
      )}

      {/* Bowling Leaderboard */}
      {tab === 'bowling' && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3.5 text-left w-12">#</th><th className="px-4 py-3.5 text-left">Player</th>
              <th className="px-4 py-3.5 text-left">Team</th><th className="px-4 py-3.5 text-center">Inn</th>
              <th className="px-4 py-3.5 text-center">Wickets</th><th className="px-4 py-3.5 text-center">Overs</th>
              <th className="px-4 py-3.5 text-center">Runs</th><th className="px-4 py-3.5 text-center">Econ</th>
              <th className="px-4 py-3.5 text-center">Avg</th>
            </tr></thead>
            <tbody>
              {topWickets.map((p, i) => (
                <tr key={p.id} className={`table-row ${i < 3 ? 'bg-accent-500/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5">
                    {i < 3 ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${getMedalStyle(i)}`}>{i + 1}</span>
                    ) : <span className="text-surface-500 font-medium ml-1">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="player-avatar w-9 h-9 text-xs font-bold text-white">{p.player_name?.split(' ').map(n=>n[0]).join('')}</div>
                      <span className="font-semibold text-white">{p.player_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-surface-400">{p.short_name}</td>
                  <td className="px-4 py-3.5 text-center text-surface-400">{p.innings}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-accent-400 text-lg">{p.total_wickets}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.total_overs}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.runs_conceded}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.avg_economy}</td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{p.bowling_avg || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topWickets.length === 0 && <p className="text-surface-500 text-center py-10">No bowling data available</p>}
        </div>
      )}
    </div>
  );
}

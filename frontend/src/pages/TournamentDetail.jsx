import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentsAPI } from '../services/api';

const TEAM_LOGOS = {
  'Royal Challengers': '/images/team-rch.png', 'Super Kings': '/images/team-sk.png',
  'Thunder Strikers': '/images/team-ts.png', 'Storm Warriors': '/images/team-sw.png',
};

export default function TournamentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { tournamentsAPI.getById(id).then(r => setData(r.data)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-surface-400">Tournament not found</div>;

  const tabs = ['overview', 'teams', 'matches', 'points'];

  return (
    <div className="space-y-6 page-enter">
      <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Tournaments
      </Link>

      <div className="glass-card p-8">
        <h1 className="page-title">{data.name}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-surface-400">
          <span className="badge-upcoming badge">{data.format}</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {data.venue || 'TBD'}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date(data.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        {data.description && <p className="text-surface-400 mt-4">{data.description}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-surface-900/60 rounded-xl p-1.5 border border-surface-700/20">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-surface-500 hover:text-white border border-transparent'}`}>
            {t === 'points' ? 'Points Table' : t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card"><p className="stat-value">{data.teams?.length || 0}</p><p className="stat-label">Teams</p></div>
          <div className="stat-card"><p className="stat-value">{data.matches?.length || 0}</p><p className="stat-label">Matches</p></div>
          <div className="stat-card"><p className="stat-value">{data.matches?.filter(m => m.status === 'completed').length || 0}</p><p className="stat-label">Completed</p></div>
          <div className="stat-card"><p className="stat-value">{data.format}</p><p className="stat-label">Format</p></div>
        </div>
      )}

      {tab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.teams?.map(t => (
            <Link key={t.id} to={`/teams/${t.id}`} className="glass-card-hover p-5">
              <div className="flex items-center gap-3">
                <div className="team-logo w-12 h-12">
                  {TEAM_LOGOS[t.name] ? <img src={TEAM_LOGOS[t.name]} alt={t.name} /> :
                    <span className="text-sm font-bold text-primary-400">{t.short_name}</span>}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t.name}</h3>
                  <p className="text-xs text-surface-500">Group {t.group_name} &middot; Seed #{t.seed_number}</p>
                </div>
              </div>
            </Link>
          ))}
          {(!data.teams || data.teams.length === 0) && <p className="text-surface-500 col-span-3 text-center py-10">No teams registered</p>}
        </div>
      )}

      {tab === 'matches' && (
        <div className="space-y-3">
          {data.matches?.map(m => (
            <Link key={m.id} to={`/matches/${m.id}`} className="glass-card-hover p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white">{m.team1_name}</span>
                <span className="vs-badge text-xs">vs</span>
                <span className="font-semibold text-white">{m.team2_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {m.winner_name && (
                  <span className="text-primary-400 flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    {m.winner_name}
                  </span>
                )}
                <span className={`badge ${m.status === 'completed' ? 'badge-completed' : 'badge-scheduled'}`}>{m.status}</span>
              </div>
            </Link>
          ))}
          {(!data.matches || data.matches.length === 0) && <p className="text-surface-500 text-center py-10">No matches scheduled</p>}
        </div>
      )}

      {tab === 'points' && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header">
              <th className="px-4 py-3.5 text-left">#</th><th className="px-4 py-3.5 text-left">Team</th>
              <th className="px-4 py-3.5 text-center">P</th><th className="px-4 py-3.5 text-center">W</th>
              <th className="px-4 py-3.5 text-center">L</th><th className="px-4 py-3.5 text-center">Pts</th>
              <th className="px-4 py-3.5 text-center">NRR</th>
            </tr></thead>
            <tbody>
              {data.points_table?.map((pt, i) => (
                <tr key={pt.team_id} className={`table-row ${i < 2 ? 'bg-primary-500/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5 text-surface-500 font-medium">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="team-logo w-8 h-8 rounded-lg">
                        {TEAM_LOGOS[pt.team_name] ? <img src={TEAM_LOGOS[pt.team_name]} alt="" /> :
                          <span className="text-[10px] font-bold text-primary-400">{pt.short_name}</span>}
                      </div>
                      <span className="font-semibold text-white">{pt.team_name}</span>
                      <span className="text-surface-500 text-xs">{pt.short_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-surface-300">{pt.matches_played}</td>
                  <td className="px-4 py-3.5 text-center text-green-400 font-medium">{pt.wins}</td>
                  <td className="px-4 py-3.5 text-center text-red-400 font-medium">{pt.losses}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-primary-400">{pt.points}</td>
                  <td className="px-4 py-3.5 text-center text-surface-400">{parseFloat(pt.net_run_rate).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data.points_table || data.points_table.length === 0) && <p className="text-surface-500 text-center py-10">No standings yet</p>}
        </div>
      )}
    </div>
  );
}

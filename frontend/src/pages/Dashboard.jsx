import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../services/api';



function StatIcon({ type }) {
  const icons = {
    teams: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    players: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    tournaments: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 19.24 7 20h10c0-.76-.85-1.25-2.03-1.79C14.47 17.98 14 17.55 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    matches: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  };
  return icons[type] || null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.dashboard().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Teams', value: stats?.total_teams || 0, type: 'teams', gradient: 'from-emerald-500/15 to-teal-500/15', border: 'border-emerald-500/20' },
    { label: 'Players', value: stats?.total_players || 0, type: 'players', gradient: 'from-blue-500/15 to-cyan-500/15', border: 'border-blue-500/20' },
    { label: 'Tournaments', value: stats?.total_tournaments || 0, type: 'tournaments', gradient: 'from-amber-500/15 to-orange-500/15', border: 'border-amber-500/20' },
    { label: 'Matches', value: stats?.total_matches || 0, type: 'matches', gradient: 'from-primary-500/15 to-accent-500/15', border: 'border-primary-500/20' },
  ];

  const getStatusBadge = (status) => {
    const map = { live: 'badge-live', completed: 'badge-completed', scheduled: 'badge-scheduled', upcoming: 'badge-upcoming' };
    return map[status] || 'badge-upcoming';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
          <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
        </div>
        <p className="page-subtitle ml-5">Here's what's happening in your cricket world</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label}
            className={`glass-card p-5 animate-slide-up group relative overflow-hidden`}
            style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} border ${card.border} flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-300`}>
                <StatIcon type={card.type} />
              </div>
              <p className="stat-value animate-counter">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Matches */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Recent Matches</h2>
          <Link to="/matches" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors flex items-center gap-1.5">
            View all
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        {stats?.recent_matches?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_matches.map(match => (
              <Link key={match.id} to={`/matches/${match.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 transition-all duration-300 group border border-transparent hover:border-surface-700/30">
                <div className="flex items-center gap-5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="team-logo w-10 h-10">
                      {match.team1_logo ?
                        <img src={match.team1_logo} alt={match.team1_name} className="w-full h-full object-contain" /> :
                        <span className="text-sm font-bold text-primary-400">{match.team1_short || match.team1_name?.[0]}</span>}
                    </div>
                    <p className="font-semibold text-white text-sm">{match.team1_name}</p>
                  </div>
                  <span className="vs-badge">VS</span>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white text-sm">{match.team2_name}</p>
                    <div className="team-logo w-10 h-10">
                      {match.team2_logo ?
                        <img src={match.team2_logo} alt={match.team2_name} className="w-full h-full object-contain" /> :
                        <span className="text-sm font-bold text-primary-400">{match.team2_short || match.team2_name?.[0]}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={getStatusBadge(match.status)}>{match.status}</span>
                  <span className="text-surface-500 text-xs hidden sm:block">
                    {new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-surface-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p className="text-surface-500">No matches yet. Create a tournament to get started.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'team_manager') && (
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.45s' }}>
          <h2 className="section-title mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add Team', desc: 'Create new squad', to: '/teams', show: user?.role === 'admin', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg> },
              { label: 'Add Player', desc: 'Register athlete', to: '/players', show: true, icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
              { label: 'New Tournament', desc: 'Organize event', to: '/tournaments', show: user?.role === 'admin', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
              { label: 'Enter Scores', desc: 'Update scorecard', to: '/scorecards', show: true, icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg> },
            ].filter(a => a.show).map(action => (
              <Link key={action.label} to={action.to}
                className="group bg-surface-800/30 hover:bg-surface-800/60 border border-surface-700/20 hover:border-primary-500/20 rounded-xl p-4 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center text-primary-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </div>
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs text-surface-500 mt-0.5">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

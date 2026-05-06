import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';



export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { teamsAPI.getById(id).then(r => setTeam(r.data)).finally(() => setLoading(false)); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this team? All its players will be removed from this team.')) return;
    try {
      await teamsAPI.delete(id);
      toast.success('Team deleted');
      navigate('/teams');
    } catch (err) { toast.error('Failed to delete team'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!team) return <div className="text-center py-12 text-surface-400">Team not found</div>;

  const roleColors = {
    batsman: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    bowler: 'text-red-400 bg-red-500/10 border-red-500/20',
    all_rounder: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    wicket_keeper: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  return (
    <div className="space-y-6 page-enter">
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Teams
      </Link>

      <div className="glass-card p-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-800/60 border border-surface-700/30 flex items-center justify-center shadow-lg">
            {team.logo_url ?
              <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> :
              <span className="text-4xl font-bold text-primary-400 font-display">{team.short_name?.[0] || team.name?.[0]}</span>}
          </div>
          <div>
            <h1 className="page-title">{team.name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-surface-400">
              <span className="font-medium">{team.short_name}</span>
              {team.home_ground && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {team.home_ground}
                </span>
              )}
              {team.founded_year && <span>Est. {team.founded_year}</span>}
            </div>
          </div>
          {isAdmin && (
            <div className="ml-auto">
              <button onClick={handleDelete} className="btn-secondary text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete Team
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="section-title mb-4">Squad ({team.players?.length || 0} Players)</h2>
        {team.players?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="table-header">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Batting</th>
                <th className="px-4 py-3 text-left">Bowling</th>
                <th className="px-4 py-3 text-left">Nationality</th>
              </tr></thead>
              <tbody>
                {team.players.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 py-3 font-mono text-surface-500">{p.jersey_number || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={`${p.first_name} ${p.last_name}`} className="w-8 h-8 rounded-full object-cover border border-surface-700/50 flex-shrink-0 bg-surface-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                        )}
                        <span className="font-medium text-white">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${roleColors[p.role] || ''}`}>{p.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-surface-400 text-sm">{p.batting_style?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-surface-400 text-sm">{p.bowling_style?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-4 py-3 text-surface-400 text-sm">{p.nationality || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-surface-500 text-center py-10">No players in this team yet</p>}
      </div>
    </div>
  );
}

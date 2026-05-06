import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', short_name: '', home_ground: '', founded_year: '', logo_url: '' });
  const { isAdmin, isManager } = useAuth();

  const fetchTeams = () => teamsAPI.getAll().then(r => setTeams(r.data)).catch(() => toast.error('Failed to load teams')).finally(() => setLoading(false));
  useEffect(() => { fetchTeams(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await teamsAPI.create(form);
      toast.success('Team created!');
      setShowModal(false);
      setForm({ name: '', short_name: '', home_ground: '', founded_year: '', logo_url: '' });
      fetchTeams();
    } catch (err) { toast.error('Failed to create team'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
            <h1 className="page-title">Teams</h1>
          </div>
          <p className="page-subtitle ml-5">{teams.length} teams registered</p>
        </div>
        {(isAdmin || isManager) && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Team
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team, i) => (
          <Link key={team.id} to={`/teams/${team.id}`}
            className="glass-card-hover p-6 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="team-logo w-16 h-16 rounded-2xl">
                {team.logo_url
                  ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
                  : <span className="text-2xl font-bold text-primary-400 font-display">{team.short_name?.[0] || team.name[0]}</span>
                }
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{team.name}</h3>
                <p className="text-sm text-surface-500">{team.short_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface-800/30 rounded-xl p-3 border border-surface-700/20">
                <p className="text-surface-500 text-xs font-medium">Players</p>
                <p className="text-white font-semibold mt-0.5">{team.player_count || 0}</p>
              </div>
              <div className="bg-surface-800/30 rounded-xl p-3 border border-surface-700/20">
                <p className="text-surface-500 text-xs font-medium">Home Ground</p>
                <p className="text-white font-semibold text-xs mt-0.5">{team.home_ground || '—'}</p>
              </div>
            </div>
            {team.manager_name && (
              <div className="flex items-center gap-2 mt-3 text-xs text-surface-500">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Manager: {team.manager_name}
              </div>
            )}
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="glass-card p-16 text-center">
          <svg className="w-14 h-14 text-surface-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p className="text-surface-400 text-lg">No teams yet</p>
          {(isAdmin || isManager) && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create First Team</button>}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-8 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="section-title mb-6">Create New Team</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Team Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
              <input placeholder="Short Name (e.g. RCH)" value={form.short_name} onChange={e => setForm({...form, short_name: e.target.value})} className="input-field" required maxLength={10} />
              <input placeholder="Home Ground" value={form.home_ground} onChange={e => setForm({...form, home_ground: e.target.value})} className="input-field" />
              <input placeholder="Founded Year" type="number" value={form.founded_year} onChange={e => setForm({...form, founded_year: e.target.value})} className="input-field" />
              <input placeholder="Team Logo URL (https://...image.png)" value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} className="input-field" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
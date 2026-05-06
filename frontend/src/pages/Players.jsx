import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playersAPI, teamsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ team_id: '', role: '', search: '' });
  const [form, setForm] = useState({ first_name: '', last_name: '', role: 'batsman', batting_style: 'right_hand', bowling_style: 'none', team_id: '', nationality: '', jersey_number: '' });
  const { isAdmin, isManager } = useAuth();

  const fetchPlayers = () => playersAPI.getAll(filter).then(r => setPlayers(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchPlayers(); }, [filter]);
  useEffect(() => { teamsAPI.getAll().then(r => setTeams(r.data)).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await playersAPI.create(form);
      toast.success('Player added!');
      setShowModal(false);
      fetchPlayers();
    } catch (err) { toast.error('Failed to add player'); }
  };

  const roleColors = {
    batsman: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    bowler: 'text-red-400 bg-red-500/10 border-red-500/20',
    all_rounder: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    wicket_keeper: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
            <h1 className="page-title">Players</h1>
          </div>
          <p className="page-subtitle ml-5">{players.length} players found</p>
        </div>
        {(isAdmin || isManager) && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Player
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search players..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})}
            className="input-field pl-10" />
        </div>
        <select value={filter.team_id} onChange={e => setFilter({...filter, team_id: e.target.value})} className="select-field max-w-[200px]">
          <option value="">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filter.role} onChange={e => setFilter({...filter, role: e.target.value})} className="select-field max-w-[180px]">
          <option value="">All Roles</option>
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="all_rounder">All Rounder</option>
          <option value="wicket_keeper">Wicket Keeper</option>
        </select>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p, i) => (
          <div key={p.id} className="glass-card p-5 animate-slide-up group hover:border-surface-600/50 transition-all duration-300" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="player-avatar text-white font-bold text-sm">
                {p.first_name[0]}{p.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{p.first_name} {p.last_name}</h3>
                <p className="text-xs text-surface-500 truncate">
                  {p.team_name || 'Free Agent'}
                  {p.jersey_number ? ` · #${p.jersey_number}` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`badge border ${roleColors[p.role] || ''}`}>{p.role?.replace('_', ' ')}</span>
              <span className="badge bg-surface-800/60 text-surface-400 border border-surface-700/30">{p.batting_style?.replace('_', ' ')}</span>
              {p.nationality && <span className="badge bg-surface-800/60 text-surface-400 border border-surface-700/30">{p.nationality}</span>}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="glass-card p-16 text-center">
          <svg className="w-14 h-14 text-surface-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p className="text-surface-400 text-lg">No players found</p>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="section-title mb-6">Add New Player</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="First Name" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="input-field" required />
                <input placeholder="Last Name" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="input-field" required />
              </div>
              <select value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})} className="select-field">
                <option value="">Select Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="select-field">
                  <option value="batsman">Batsman</option><option value="bowler">Bowler</option>
                  <option value="all_rounder">All Rounder</option><option value="wicket_keeper">Wicket Keeper</option>
                </select>
                <select value={form.batting_style} onChange={e => setForm({...form, batting_style: e.target.value})} className="select-field">
                  <option value="right_hand">Right Hand</option><option value="left_hand">Left Hand</option>
                </select>
              </div>
              <select value={form.bowling_style} onChange={e => setForm({...form, bowling_style: e.target.value})} className="select-field">
                <option value="none">None</option><option value="right_arm_fast">Right Arm Fast</option>
                <option value="left_arm_fast">Left Arm Fast</option><option value="right_arm_spin">Right Arm Spin</option>
                <option value="left_arm_spin">Left Arm Spin</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nationality" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} className="input-field" />
                <input placeholder="Jersey #" type="number" value={form.jersey_number} onChange={e => setForm({...form, jersey_number: e.target.value})} className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Player</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

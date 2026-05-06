import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { playersAPI, teamsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ team_id: '', role: '', search: '' });
  const [form, setForm] = useState({ first_name: '', last_name: '', role: 'batsman', batting_style: 'right_hand', bowling_style: 'none', team_id: '', nationality: '', jersey_number: '', avatar_url: '' });
  const [editingId, setEditingId] = useState(null);
  // FIX: track image preview separately from avatar_url
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const { isAdmin, isManager } = useAuth();

  const fetchPlayers = () => playersAPI.getAll(filter)
    .then(r => setPlayers(r.data))
    .catch(err => toast.error('Failed to load players'))  // FIX: show error instead of silently swallowing
    .finally(() => setLoading(false));

  useEffect(() => { fetchPlayers(); }, [filter]);
  useEffect(() => { teamsAPI.getAll().then(r => setTeams(r.data)).catch(() => {}); }, []);

  // FIX: Handle image file selection — convert to base64 data URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...form };
      if (dataToSubmit.team_id === '') dataToSubmit.team_id = null;
      if (dataToSubmit.jersey_number === '') dataToSubmit.jersey_number = null;
      if (dataToSubmit.avatar_url === '') dataToSubmit.avatar_url = null;
      if (dataToSubmit.nationality === '') dataToSubmit.nationality = null;

      if (editingId) {
        await playersAPI.update(editingId, dataToSubmit);
        toast.success('Player updated!');
      } else {
        await playersAPI.create(dataToSubmit);
        toast.success('Player added!');
      }
      setShowModal(false);
      setImagePreview('');
      fetchPlayers();
    } catch (err) {
      // FIX: show the actual error message from the server if available
      const msg = err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || `Failed to ${editingId ? 'update' : 'add'} player`;
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      await playersAPI.delete(id);
      toast.success('Player deleted');
      fetchPlayers();
    } catch (err) { toast.error('Failed to delete player'); }
  };

  // FIX: open modal helper with image preview reset
  const openEditModal = (p) => {
    setForm({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      role: p.role || 'batsman',
      batting_style: p.batting_style || 'right_hand',
      bowling_style: p.bowling_style || 'none',
      team_id: p.team_id || '',
      nationality: p.nationality || '',
      jersey_number: p.jersey_number || '',
      avatar_url: p.avatar_url || ''
    });
    setImagePreview(p.avatar_url || '');
    setEditingId(p.id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setForm({ first_name: '', last_name: '', role: 'batsman', batting_style: 'right_hand', bowling_style: 'none', team_id: '', nationality: '', jersey_number: '', avatar_url: '' });
    setImagePreview('');
    setEditingId(null);
    setShowModal(true);
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
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
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
          <div key={p.id} className="glass-card p-5 animate-slide-up group hover:border-surface-600/50 transition-all duration-300 relative" style={{ animationDelay: `${i * 0.03}s` }}>
            {/* FIX: Removed opacity-0 — buttons are now always visible, not just on hover */}
            <div className="absolute top-2 right-2 flex gap-1">
              {(isAdmin || isManager) && (
                <>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 bg-surface-800 hover:bg-primary-500/20 text-surface-400 hover:text-primary-400 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-surface-800 hover:bg-red-500/20 text-surface-400 hover:text-red-400 rounded transition-colors" title="Delete">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mb-3">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={`${p.first_name} ${p.last_name}`} className="w-12 h-12 rounded-full object-cover border-2 border-surface-700/50 flex-shrink-0 bg-surface-800" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {p.first_name[0]}{p.last_name[0]}
                </div>
              )}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="section-title mb-6">{editingId ? 'Edit Player' : 'Add New Player'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all_rounder">All Rounder</option>
                  <option value="wicket_keeper">Wicket Keeper</option>
                </select>
                <select value={form.batting_style} onChange={e => setForm({...form, batting_style: e.target.value})} className="select-field">
                  <option value="right_hand">Right Hand</option>
                  <option value="left_hand">Left Hand</option>
                </select>
              </div>
              {/* FIX: Added missing right_arm_medium and left_arm_medium options */}
              <select value={form.bowling_style} onChange={e => setForm({...form, bowling_style: e.target.value})} className="select-field">
                <option value="none">None</option>
                <option value="right_arm_fast">Right Arm Fast</option>
                <option value="left_arm_fast">Left Arm Fast</option>
                <option value="right_arm_medium">Right Arm Medium</option>
                <option value="left_arm_medium">Left Arm Medium</option>
                <option value="right_arm_spin">Right Arm Spin</option>
                <option value="left_arm_spin">Left Arm Spin</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nationality" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} className="input-field" />
                <input placeholder="Jersey #" type="number" value={form.jersey_number} onChange={e => setForm({...form, jersey_number: e.target.value})} className="input-field" />
              </div>

              {/* FIX: Image upload section — replaces plain URL text field */}
              <div className="space-y-2">
                <label className="text-sm text-surface-400">Player Photo</label>
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-700 bg-surface-800 flex-shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* File upload button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary w-full text-sm py-1.5"
                    >
                      {imagePreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {/* URL fallback */}
                    <input
                      placeholder="Or paste image URL"
                      value={form.avatar_url && !form.avatar_url.startsWith('data:') ? form.avatar_url : ''}
                      onChange={e => {
                        setForm({...form, avatar_url: e.target.value});
                        setImagePreview(e.target.value);
                      }}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(''); setForm(prev => ({...prev, avatar_url: ''})); }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setImagePreview(''); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Save Changes' : 'Add Player'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
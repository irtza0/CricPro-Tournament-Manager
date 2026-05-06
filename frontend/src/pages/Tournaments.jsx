import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tournamentsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', format: 'T20', start_date: '', end_date: '', venue: '', max_teams: 8 });
  const { isAdmin } = useAuth();

  useEffect(() => { tournamentsAPI.getAll().then(r => setTournaments(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tournamentsAPI.create(form);
      toast.success('Tournament created!');
      setShowModal(false);
      tournamentsAPI.getAll().then(r => setTournaments(r.data));
    } catch (err) { toast.error('Failed to create tournament'); }
  };

  const statusColors = { upcoming: 'badge-upcoming', ongoing: 'badge-live', completed: 'badge-completed', cancelled: 'bg-surface-500/20 text-surface-400' };
  const formatColors = { T20: 'from-orange-500 to-red-500', ODI: 'from-blue-500 to-cyan-500', Test: 'from-green-500 to-emerald-500' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
            <h1 className="page-title">Tournaments</h1>
          </div>
          <p className="page-subtitle ml-5">{tournaments.length} tournaments</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Tournament
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tournaments.map((t, i) => (
          <Link key={t.id} to={`/tournaments/${t.id}`} className="glass-card-hover p-6 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${formatColors[t.format] || 'from-surface-500 to-surface-600'} flex items-center justify-center text-white font-bold text-xs`}>
                  {t.format}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{t.name}</h3>
                  <p className="text-sm text-surface-500 flex items-center gap-1.5 mt-0.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {t.venue || 'TBD'}
                  </p>
                </div>
              </div>
              <span className={`badge ${statusColors[t.status]}`}>{t.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-surface-800/30 rounded-xl p-3 text-center border border-surface-700/20">
                <p className="text-surface-500 text-xs font-medium">Teams</p>
                <p className="text-white font-semibold mt-0.5">{t.team_count || 0}/{t.max_teams}</p>
              </div>
              <div className="bg-surface-800/30 rounded-xl p-3 text-center border border-surface-700/20">
                <p className="text-surface-500 text-xs font-medium">Start</p>
                <p className="text-white font-semibold text-xs mt-0.5">{new Date(t.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="bg-surface-800/30 rounded-xl p-3 text-center border border-surface-700/20">
                <p className="text-surface-500 text-xs font-medium">End</p>
                <p className="text-white font-semibold text-xs mt-0.5">{t.end_date ? new Date(t.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="glass-card p-16 text-center">
          <svg className="w-14 h-14 text-surface-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          <p className="text-surface-400 text-lg">No tournaments yet</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-8 w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="section-title mb-6">Create Tournament</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Tournament Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.format} onChange={e => setForm({...form, format: e.target.value})} className="select-field">
                  <option value="T20">T20</option><option value="ODI">ODI</option><option value="Test">Test</option><option value="T10">T10</option>
                </select>
                <input type="number" placeholder="Max Teams" value={form.max_teams} onChange={e => setForm({...form, max_teams: e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-surface-400 mb-1 block font-medium">Start Date</label><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="input-field" required /></div>
                <div><label className="text-xs text-surface-400 mb-1 block font-medium">End Date</label><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="input-field" /></div>
              </div>
              <input placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="input-field" />
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

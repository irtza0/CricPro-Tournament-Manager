import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchesAPI, tournamentsAPI, teamsAPI } from '../services/api';
import toast from 'react-hot-toast';


function TeamBadge({ name, logo }) {
  return (
    <div className="team-logo w-10 h-10">
      {logo ? <img src={logo} alt={name} className="w-full h-full object-contain" /> :
        <span className="text-sm font-bold text-primary-400">{name?.[0]}</span>}
    </div>
  );
}


export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ tournament_id: '', status: '' });
  const [form, setForm] = useState({ tournament_id: '', team1_id: '', team2_id: '', match_date: '', venue: '', match_type: 'group', overs: 20 });
  const { isAdmin } = useAuth();

  useEffect(() => { matchesAPI.getAll(filter).then(r => setMatches(r.data)).catch(() => {}).finally(() => setLoading(false)); }, [filter]);
  useEffect(() => { tournamentsAPI.getAll().then(r => setTournaments(r.data)).catch(() => {}); teamsAPI.getAll().then(r => setTeams(r.data)).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await matchesAPI.create(form);
      toast.success('Match scheduled!');
      setShowModal(false);
      matchesAPI.getAll(filter).then(r => setMatches(r.data));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const statusBadge = (s) => ({ live: 'badge-live', completed: 'badge-completed', scheduled: 'badge-scheduled', upcoming: 'badge-upcoming' }[s] || 'badge-upcoming');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
            <h1 className="page-title">Matches</h1>
          </div>
          <p className="page-subtitle ml-5">{matches.length} matches</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Schedule Match
          </button>
        )}
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select value={filter.tournament_id} onChange={e => setFilter({...filter, tournament_id: e.target.value})} className="select-field max-w-[250px]">
          <option value="">All Tournaments</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="select-field max-w-[180px]">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option><option value="live">Live</option>
          <option value="completed">Completed</option><option value="abandoned">Abandoned</option>
        </select>
      </div>

      <div className="space-y-4">
        {matches.map((m, i) => (
          <Link key={m.id} to={`/matches/${m.id}`} className="glass-card-hover p-6 block animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5 flex-1">
                <div className="flex items-center gap-3 min-w-[140px] justify-end">
                  <p className="font-semibold text-white text-right">{m.team1_name}</p>
                  <TeamBadge name={m.team1_name} logo={m.team1_logo} />
                </div>
                <span className="vs-badge">VS</span>
                <div className="flex items-center gap-3 min-w-[140px]">
                  <TeamBadge name={m.team2_name} logo={m.team2_logo} />
                  <p className="font-semibold text-white">{m.team2_name}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${statusBadge(m.status)}`}>{m.status}</span>
                <span className="text-xs text-surface-500">{new Date(m.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {m.result_summary && <p className="text-xs text-primary-400 font-medium">{m.result_summary}</p>}
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-surface-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                {m.tournament_name}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {m.venue || 'TBD'}
              </span>
              <span className="capitalize">{m.match_type?.replace('_', ' ')}</span>
            </div>
          </Link>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="glass-card p-16 text-center">
          <svg className="w-14 h-14 text-surface-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p className="text-surface-400 text-lg">No matches found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-8 w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="section-title mb-6">Schedule Match</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <select value={form.tournament_id} onChange={e => setForm({...form, tournament_id: e.target.value})} className="select-field" required>
                <option value="">Select Tournament</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select value={form.team1_id} onChange={e => setForm({...form, team1_id: e.target.value})} className="select-field" required>
                  <option value="">Team 1</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={form.team2_id} onChange={e => setForm({...form, team2_id: e.target.value})} className="select-field" required>
                  <option value="">Team 2</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <input type="datetime-local" value={form.match_date} onChange={e => setForm({...form, match_date: e.target.value})} className="input-field" required />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="input-field" />
                <select value={form.match_type} onChange={e => setForm({...form, match_type: e.target.value})} className="select-field">
                  <option value="group">Group</option><option value="quarter_final">Quarter Final</option>
                  <option value="semi_final">Semi Final</option><option value="final">Final</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { matchesAPI, playersAPI, scorecardsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ScorecardEntry() {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [entryType, setEntryType] = useState('batting');
  const [battingForm, setBattingForm] = useState({ match_id: '', player_id: '', team_id: '', batting_order: 1, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, is_out: false, dismissal_type: 'not_out' });
  const [bowlingForm, setBowlingForm] = useState({ match_id: '', player_id: '', team_id: '', overs_bowled: 0, maidens: 0, runs_conceded: 0, wickets: 0, no_balls: 0, wides: 0 });
  const [inningsForm, setInningsForm] = useState({ match_id: '', batting_team_id: '', bowling_team_id: '', innings_number: 1, total_runs: 0, total_wickets: 0, total_overs: 0, extras: 0 });

  useEffect(() => { matchesAPI.getAll().then(r => setMatches(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (selectedMatch) { playersAPI.getAll().then(r => setPlayers(r.data)).catch(() => {}); } }, [selectedMatch]);

  const handleBattingSubmit = async (e) => {
    e.preventDefault();
    try { await scorecardsAPI.addBatting({ ...battingForm, match_id: selectedMatch }); toast.success('Batting entry added!'); } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleBowlingSubmit = async (e) => {
    e.preventDefault();
    try { await scorecardsAPI.addBowling({ ...bowlingForm, match_id: selectedMatch }); toast.success('Bowling entry added!'); } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleInningsSubmit = async (e) => {
    e.preventDefault();
    try { await scorecardsAPI.addInnings({ ...inningsForm, match_id: selectedMatch }); toast.success('Innings added!'); } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const matchObj = matches.find(m => m.id === selectedMatch);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
          <h1 className="page-title">Scorecard Entry</h1>
        </div>
        <p className="page-subtitle ml-5">Enter match scores and statistics</p>
      </div>

      {/* Match Selection */}
      <div className="glass-card p-6">
        <h2 className="section-title mb-4">Select Match</h2>
        <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)} className="select-field">
          <option value="">Choose a match...</option>
          {matches.map(m => <option key={m.id} value={m.id}>{m.team1_name} vs {m.team2_name} — {new Date(m.match_date).toLocaleDateString()}</option>)}
        </select>
      </div>

      {selectedMatch && (
        <>
          {/* Entry Type Tabs */}
          <div className="flex gap-1.5 bg-surface-900/60 rounded-xl p-1.5 border border-surface-700/20">
            {['batting', 'bowling', 'innings'].map(t => (
              <button key={t} onClick={() => setEntryType(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all flex-1
                ${entryType === t ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-surface-500 hover:text-white border border-transparent'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Batting Form */}
          {entryType === 'batting' && (
            <form onSubmit={handleBattingSubmit} className="glass-card p-6 space-y-4">
              <h2 className="section-title">Batting Entry</h2>
              <div className="grid grid-cols-2 gap-4">
                <select value={battingForm.player_id} onChange={e => setBattingForm({...battingForm, player_id: e.target.value})} className="select-field" required>
                  <option value="">Select Player</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.team_name})</option>)}
                </select>
                <select value={battingForm.team_id} onChange={e => setBattingForm({...battingForm, team_id: e.target.value})} className="select-field" required>
                  <option value="">Select Team</option>
                  {matchObj && <><option value={matchObj.team1_id}>{matchObj.team1_name}</option><option value={matchObj.team2_id}>{matchObj.team2_name}</option></>}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Runs</label><input type="number" min="0" value={battingForm.runs_scored} onChange={e => setBattingForm({...battingForm, runs_scored: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Balls</label><input type="number" min="0" value={battingForm.balls_faced} onChange={e => setBattingForm({...battingForm, balls_faced: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Order</label><input type="number" min="1" value={battingForm.batting_order} onChange={e => setBattingForm({...battingForm, batting_order: parseInt(e.target.value)})} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">4s</label><input type="number" min="0" value={battingForm.fours} onChange={e => setBattingForm({...battingForm, fours: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">6s</label><input type="number" min="0" value={battingForm.sixes} onChange={e => setBattingForm({...battingForm, sixes: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Out?</label>
                  <select value={battingForm.is_out.toString()} onChange={e => setBattingForm({...battingForm, is_out: e.target.value === 'true'})} className="select-field"><option value="false">Not Out</option><option value="true">Out</option></select>
                </div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Dismissal</label>
                  <select value={battingForm.dismissal_type} onChange={e => setBattingForm({...battingForm, dismissal_type: e.target.value})} className="select-field">
                    <option value="not_out">Not Out</option><option value="bowled">Bowled</option><option value="caught">Caught</option><option value="lbw">LBW</option><option value="run_out">Run Out</option><option value="stumped">Stumped</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary">Add Batting Entry</button>
            </form>
          )}

          {/* Bowling Form */}
          {entryType === 'bowling' && (
            <form onSubmit={handleBowlingSubmit} className="glass-card p-6 space-y-4">
              <h2 className="section-title">Bowling Entry</h2>
              <div className="grid grid-cols-2 gap-4">
                <select value={bowlingForm.player_id} onChange={e => setBowlingForm({...bowlingForm, player_id: e.target.value})} className="select-field" required>
                  <option value="">Select Bowler</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
                <select value={bowlingForm.team_id} onChange={e => setBowlingForm({...bowlingForm, team_id: e.target.value})} className="select-field" required>
                  <option value="">Select Team</option>
                  {matchObj && <><option value={matchObj.team1_id}>{matchObj.team1_name}</option><option value={matchObj.team2_id}>{matchObj.team2_name}</option></>}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Overs</label><input type="number" step="0.1" min="0" value={bowlingForm.overs_bowled} onChange={e => setBowlingForm({...bowlingForm, overs_bowled: parseFloat(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Maidens</label><input type="number" min="0" value={bowlingForm.maidens} onChange={e => setBowlingForm({...bowlingForm, maidens: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Runs</label><input type="number" min="0" value={bowlingForm.runs_conceded} onChange={e => setBowlingForm({...bowlingForm, runs_conceded: parseInt(e.target.value)})} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Wickets</label><input type="number" min="0" value={bowlingForm.wickets} onChange={e => setBowlingForm({...bowlingForm, wickets: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">No Balls</label><input type="number" min="0" value={bowlingForm.no_balls} onChange={e => setBowlingForm({...bowlingForm, no_balls: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Wides</label><input type="number" min="0" value={bowlingForm.wides} onChange={e => setBowlingForm({...bowlingForm, wides: parseInt(e.target.value)})} className="input-field" /></div>
              </div>
              <button type="submit" className="btn-primary">Add Bowling Entry</button>
            </form>
          )}

          {/* Innings Form */}
          {entryType === 'innings' && (
            <form onSubmit={handleInningsSubmit} className="glass-card p-6 space-y-4">
              <h2 className="section-title">Innings Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <select value={inningsForm.batting_team_id} onChange={e => setInningsForm({...inningsForm, batting_team_id: e.target.value})} className="select-field" required>
                  <option value="">Batting Team</option>
                  {matchObj && <><option value={matchObj.team1_id}>{matchObj.team1_name}</option><option value={matchObj.team2_id}>{matchObj.team2_name}</option></>}
                </select>
                <select value={inningsForm.bowling_team_id} onChange={e => setInningsForm({...inningsForm, bowling_team_id: e.target.value})} className="select-field" required>
                  <option value="">Bowling Team</option>
                  {matchObj && <><option value={matchObj.team1_id}>{matchObj.team1_name}</option><option value={matchObj.team2_id}>{matchObj.team2_name}</option></>}
                </select>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Innings #</label><input type="number" min="1" max="2" value={inningsForm.innings_number} onChange={e => setInningsForm({...inningsForm, innings_number: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Total Runs</label><input type="number" min="0" value={inningsForm.total_runs} onChange={e => setInningsForm({...inningsForm, total_runs: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Wickets</label><input type="number" min="0" max="10" value={inningsForm.total_wickets} onChange={e => setInningsForm({...inningsForm, total_wickets: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="text-xs text-surface-400 block mb-1 font-medium">Overs</label><input type="number" step="0.1" min="0" value={inningsForm.total_overs} onChange={e => setInningsForm({...inningsForm, total_overs: parseFloat(e.target.value)})} className="input-field" /></div>
              </div>
              <button type="submit" className="btn-primary">Save Innings</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/40 via-surface-950/20 to-surface-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 via-transparent to-surface-950/30" />
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 pb-16">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-display font-bold text-white leading-tight tracking-tight">
              Cricket's Ultimate<br />Showdown
            </h2>
            <p className="text-surface-300 mt-4 text-lg max-w-md leading-relaxed">
              Manage tournaments, track every run, and follow your teams through the season.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-400 font-display">500+</p>
                <p className="text-xs text-surface-400 uppercase tracking-wider mt-1">Matches</p>
              </div>
              <div className="w-px h-10 bg-surface-700/50" />
              <div className="text-center">
                <p className="text-2xl font-bold text-accent-400 font-display">120+</p>
                <p className="text-xs text-surface-400 uppercase tracking-wider mt-1">Teams</p>
              </div>
              <div className="w-px h-10 bg-surface-700/50" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-400 font-display">2.5K+</p>
                <p className="text-xs text-surface-400 uppercase tracking-wider mt-1">Players</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface-950">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="mb-10 animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-primary-600/15">
                <img src="/images/app-logo.png" alt="CricketPro" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white tracking-tight">CricketPro</h1>
                <p className="text-xs text-surface-500 uppercase tracking-wider font-medium">Tournament Manager</p>
              </div>
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-surface-400 mt-2">Sign in to manage your cricket world</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email Address</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Enter your password" required />
            </div>
            <button id="login-submit" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 py-3 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-surface-950 border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-surface-500 mt-8 text-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="divider mb-4" />
            <p className="text-[11px] text-surface-500 text-center mb-3 uppercase tracking-wider font-medium">Quick Access</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'Admin', email: 'admin@cricket.com' }, { label: 'Manager', email: 'virat@cricket.com' }, { label: 'Fan', email: 'fan@cricket.com' }].map(d => (
                <button key={d.email} type="button" onClick={() => { setEmail(d.email); setPassword('password123'); }}
                  className="bg-surface-800/60 hover:bg-surface-700 border border-surface-700/30 hover:border-primary-500/20 rounded-xl py-2.5 px-3 text-xs text-surface-400 hover:text-white transition-all font-medium">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

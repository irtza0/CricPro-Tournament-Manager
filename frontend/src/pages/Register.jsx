import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', role: 'fan' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
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
              Join the<br />Cricket Community
            </h2>
            <p className="text-surface-300 mt-4 text-lg max-w-md leading-relaxed">
              Create your account and start managing teams, tournaments, and match statistics.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface-950">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-primary-600/15">
                <img src="/images/app-logo.png" alt="CricketPro" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">CricketPro</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-surface-400 mt-2">Get started with your cricket journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Username</label>
              <input name="username" value={form.username} onChange={handleChange} className="input-field" placeholder="johndoe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="select-field">
                <option value="fan">Fan</option>
                <option value="team_manager">Team Manager</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 py-3 text-base">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-surface-500 mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

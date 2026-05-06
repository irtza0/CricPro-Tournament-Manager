import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX, HiLogout } from 'react-icons/hi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/tournaments', label: 'Tournaments', icon: TrophyIcon },
  { path: '/teams', label: 'Teams', icon: ShieldIcon },
  { path: '/players', label: 'Players', icon: UsersIcon },
  { path: '/matches', label: 'Matches', icon: CalendarIcon },
  { path: '/scorecards', label: 'Scorecards', icon: ClipboardIcon, roles: ['admin', 'team_manager'] },
  { path: '/leaderboard', label: 'Leaderboard', icon: ChartIcon },
];

// Clean SVG icons replacing emojis and react-icons
function DashboardIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>);
}
function TrophyIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 19.24 7 20h10c0-.76-.85-1.25-2.03-1.79C14.47 17.98 14 17.55 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>);
}
function ShieldIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
}
function UsersIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
}
function CalendarIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
}
function ClipboardIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>);
}
function ChartIcon({ className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-surface-950/95 backdrop-blur-2xl border-r border-surface-700/30
        transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-surface-700/30">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-primary-600/10">
            <img src="/images/app-logo.png" alt="Cricket Manager" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-tight tracking-tight">CricketPro</h1>
            <p className="text-[11px] text-surface-500 font-medium tracking-wide uppercase">Tournament Manager</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-surface-400 hover:text-white p-1">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest px-4 mb-3">Navigation</p>
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/15'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/60 border border-transparent'}`}>
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-primary-400' : ''}`} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-surface-700/30">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-800/30">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-surface-950 font-bold text-sm flex-shrink-0">
              {user?.full_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || user?.username}</p>
              <p className="text-[11px] text-surface-500 capitalize font-medium">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={handleLogout} className="text-surface-500 hover:text-red-400 transition-colors p-1" title="Sign out">
              <HiLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 lg:hidden bg-surface-950/90 backdrop-blur-xl border-b border-surface-700/30 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-surface-400 hover:text-white p-1">
            <HiMenu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <img src="/images/app-logo.png" alt="" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-semibold text-white text-sm">CricketPro</span>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}

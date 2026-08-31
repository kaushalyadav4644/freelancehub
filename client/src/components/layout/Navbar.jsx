import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link to={to} className={`text-sm font-medium transition-colors duration-200 ${active ? 'text-brand-400' : 'text-slate-400 hover:text-slate-100'}`}>
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getRoleLinks = () => {
    if (!user) return null;
    if (user.role === 'client') return (
      <>
        <NavLink to="/post-job">Post Job</NavLink>
        <NavLink to="/manage-jobs">My Jobs</NavLink>
        <NavLink to="/client/projects">Projects</NavLink>
      </>
    );
    if (user.role === 'freelancer') return (
      <>
        <NavLink to="/jobs">Find Work</NavLink>
        <NavLink to="/my-applications">Applications</NavLink>
        <NavLink to="/my-projects">Projects</NavLink>
      </>
    );
    if (user.role === 'admin') return (
      <>
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/jobs">Jobs</NavLink>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-emerald-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-slate-100">FreelanceHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? getRoleLinks() : (
              <>
                <NavLink to="/jobs">Browse Jobs</NavLink>
                <NavLink to="/freelancers">Find Talent</NavLink>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/messages" className="btn-ghost text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </Link>
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 max-w-[100px] truncate">{user.name}</span>
                    <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 card py-1.5 shadow-2xl animate-slide-up" onMouseLeave={() => setDropOpen(false)}>
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-medium text-slate-200 truncate">{user.email}</p>
                        <span className={`badge mt-1 ${user.role === 'admin' ? 'badge-red' : user.role === 'client' ? 'badge-blue' : 'badge-green'}`}>{user.role}</span>
                      </div>
                      <Link to="/dashboard" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={() => setDropOpen(false)}>Dashboard</Link>
                      <Link to="/edit-profile" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={() => setDropOpen(false)}>Edit Profile</Link>
                      <Link to="/payments" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={() => setDropOpen(false)}>Payments</Link>
                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">Log Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Log In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 py-4 space-y-2 animate-fade-in">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                {getRoleLinks()}
                <Link to="/messages" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Messages</Link>
                <Link to="/payments" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Payments</Link>
                <Link to="/edit-profile" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Edit Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-2 py-2 text-sm text-red-400">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/jobs" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
                <Link to="/freelancers" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Find Talent</Link>
                <Link to="/login" className="block px-2 py-2 text-sm text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn-primary text-sm inline-flex mt-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

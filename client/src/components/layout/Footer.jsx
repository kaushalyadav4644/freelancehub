import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 mt-16">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-emerald-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <span className="font-display font-bold text-lg">FreelanceHub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The modern marketplace connecting world-class freelancers with ambitious clients. Build remarkable things together.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[['Browse Jobs', '/jobs'], ['Find Talent', '/freelancers'], ['Post a Job', '/post-job'], ['How it Works', '/']].map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[['Sign Up', '/register'], ['Log In', '/login'], ['Dashboard', '/dashboard'], ['Settings', '/edit-profile']].map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} FreelanceHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs">Built with React + Node.js + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

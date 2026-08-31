import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI, usersAPI } from '../../services/api';
import JobCard from '../../components/job/JobCard';
import FreelancerCard from '../../components/freelancer/FreelancerCard';
import { Spinner } from '../../components/common';

const stats = [
  { value: '10,000+', label: 'Freelancers', icon: '👥' },
  { value: '5,000+', label: 'Jobs Posted', icon: '📋' },
  { value: '$2M+', label: 'Paid Out', icon: '💰' },
  { value: '98%', label: 'Satisfaction', icon: '⭐' },
];

const categories = [
  { id: 'web-development', label: 'Web Development', icon: '🌐', count: '1,200+' },
  { id: 'mobile-development', label: 'Mobile Apps', icon: '📱', count: '800+' },
  { id: 'design', label: 'Design', icon: '🎨', count: '950+' },
  { id: 'writing', label: 'Writing', icon: '✍️', count: '600+' },
  { id: 'marketing', label: 'Marketing', icon: '📣', count: '450+' },
  { id: 'data-science', label: 'Data Science', icon: '📊', count: '350+' },
];

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([jobsAPI.getAll({ limit: 6 }), usersAPI.getFreelancers({ limit: 6 })])
      .then(([jRes, fRes]) => {
        setJobs(jRes.data.jobs);
        setFreelancers(fRes.data.freelancers);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="page-container relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Now with real-time messaging
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6">
            The marketplace<br />
            <span className="gradient-text">built for builders</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with world-class freelancers, post projects in minutes, and ship faster. Everything you need to grow your team or your career.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/jobs" className="btn-primary text-base px-7 py-3.5">
              Find Work
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link to="/register?role=client" className="btn-secondary text-base px-7 py-3.5">
              Hire Talent
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-2xl font-bold font-display gradient-text">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-t border-slate-800/50">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-100 mb-3">Browse by Category</h2>
            <p className="text-slate-400">Find the perfect skill set for your next project</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/jobs?category=${cat.id}`} className="card-hover p-4 text-center group">
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-brand-400 transition-colors">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-1">{cat.count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-100">Latest Jobs</h2>
              <p className="text-slate-400 mt-1 text-sm">Fresh opportunities posted daily</p>
            </div>
            <Link to="/jobs" className="btn-ghost text-sm">View all →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(j => <JobCard key={j._id} job={j} />)}
            </div>
          )}
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="py-16 border-t border-slate-800/50">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-100">Top Freelancers</h2>
              <p className="text-slate-400 mt-1 text-sm">Verified professionals ready to help</p>
            </div>
            <Link to="/freelancers" className="btn-ghost text-sm">View all →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freelancers.map(f => <FreelancerCard key={f._id} freelancer={f} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600/30 to-emerald-700/20 border border-brand-500/20 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.1),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-4xl font-display font-bold text-slate-100 mb-4">Ready to get started?</h2>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">Join thousands of freelancers and clients building great things together.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-3.5">Create Free Account</Link>
                <Link to="/jobs" className="btn-secondary text-base px-8 py-3.5">Browse Jobs</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { StatCard, Avatar, StatusBadge, PageLoader } from '../../components/common';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => {
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setRecentJobs(data.recentJobs || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">Platform overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
          <Link to="/admin/jobs" className="btn-secondary text-sm">Manage Jobs</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} sub={`${stats?.clientCount} clients, ${stats?.freelancerCount} freelancers`} color="blue" />
        <StatCard icon="📋" label="Total Jobs" value={stats?.totalJobs?.toLocaleString() || 0} sub={`${stats?.openJobs} open`} color="green" />
        <StatCard icon="🔄" label="Projects" value={stats?.totalProjects?.toLocaleString() || 0} sub={`${stats?.completedProjects} completed`} color="yellow" />
        <StatCard icon="💰" label="Platform Revenue" value={`$${(stats?.platformFees || 0).toFixed(2)}`} sub={`$${(stats?.totalRevenue || 0).toLocaleString()} processed`} color="green" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clients', value: stats?.clientCount || 0, icon: '🏢' },
          { label: 'Freelancers', value: stats?.freelancerCount || 0, icon: '💼' },
          { label: 'Open Jobs', value: stats?.openJobs || 0, icon: '🟢' },
          { label: 'Transactions', value: stats?.totalPayments || 0, icon: '💳' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-xl font-bold text-slate-100">{value.toLocaleString()}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Recent Signups</h2>
            <Link to="/admin/users" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-3 hover:bg-slate-800/40 rounded-xl transition-colors">
                <Avatar name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge text-xs ${u.role === 'admin' ? 'badge-red' : u.role === 'client' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                  <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Recent Jobs</h2>
            <Link to="/admin/jobs" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map(j => (
              <div key={j._id} className="flex items-center gap-3 p-3 hover:bg-slate-800/40 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">📋</div>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${j._id}`} className="text-sm font-medium text-slate-200 hover:text-brand-400 block truncate">{j.title}</Link>
                  <p className="text-xs text-slate-500">{j.clientId?.name} • ${j.budget?.min?.toLocaleString()}</p>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'User Management', href: '/admin/users', icon: '👥', desc: 'Manage all users' },
          { label: 'Job Management', href: '/admin/jobs', icon: '📋', desc: 'Moderate job posts' },
          { label: 'Reports', href: '/admin/reports', icon: '📊', desc: 'Analytics & stats' },
          { label: 'Transactions', href: '/admin/reports', icon: '💳', desc: 'Payment history' },
        ].map(({ label, href, icon, desc }) => (
          <Link key={label} to={href} className="card-hover p-4 text-center group">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-sm font-medium text-slate-200 group-hover:text-brand-400">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

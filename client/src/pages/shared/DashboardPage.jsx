import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI, applicationsAPI, projectsAPI, paymentsAPI } from '../../services/api';
import { StatCard, StatusBadge, PageLoader } from '../../components/common';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'client') {
          const [jobsRes, projectsRes] = await Promise.all([jobsAPI.getMyJobs(), projectsAPI.getMy()]);
          setData({ jobs: jobsRes.data.jobs, projects: projectsRes.data.projects });
        } else if (user.role === 'freelancer') {
          const [appsRes, projectsRes] = await Promise.all([applicationsAPI.getMy(), projectsAPI.getMy()]);
          setData({ applications: appsRes.data.applications, projects: projectsRes.data.projects });
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user.role]);

  if (loading) return <PageLoader />;

  if (user.role === 'client') return <ClientDashboard user={user} data={data} />;
  if (user.role === 'freelancer') return <FreelancerDashboard user={user} data={data} />;
  return <div className="page-container py-10"><p className="text-slate-400">Admin: go to <Link to="/admin" className="text-brand-400">/admin</Link></p></div>;
}

function ClientDashboard({ user, data }) {
  const { jobs = [], projects = [] } = data;
  const openJobs = jobs.filter(j => j.status === 'open').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user.name} 👋</h1>
        <p className="text-slate-400 mt-1 text-sm">Here's an overview of your activity</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="📋" label="Open Jobs" value={openJobs} color="blue" />
        <StatCard icon="🔄" label="Active Projects" value={activeProjects} color="yellow" />
        <StatCard icon="✅" label="Completed" value={completedProjects} color="green" />
        <StatCard icon="💰" label="Total Spent" value={`$${(user.totalSpent || 0).toLocaleString()}`} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">My Job Posts</h2>
            <Link to="/post-job" className="btn-primary text-xs px-3 py-1.5">+ Post Job</Link>
          </div>
          {jobs.length === 0 ? <p className="text-slate-500 text-sm">No jobs posted yet.</p> : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(j => (
                <div key={j._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${j._id}`} className="text-sm font-medium text-slate-200 hover:text-brand-400 block truncate">{j.title}</Link>
                    <p className="text-xs text-slate-500 mt-0.5">{j.applicationsCount} applicants</p>
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              ))}
            </div>
          )}
          <Link to="/manage-jobs" className="btn-ghost text-xs mt-3 inline-flex">View all jobs →</Link>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Active Projects</h2>
            <Link to="/client/projects" className="btn-ghost text-xs">View all</Link>
          </div>
          {projects.length === 0 ? <p className="text-slate-500 text-sm">No active projects.</p> : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${p._id}`} className="text-sm font-medium text-slate-200 hover:text-brand-400 block truncate">{p.jobId?.title}</Link>
                    <p className="text-xs text-slate-500 mt-0.5">with {p.freelancerId?.name}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FreelancerDashboard({ user, data }) {
  const { applications = [], projects = [] } = data;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'submitted').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user.name} 👋</h1>
        <p className="text-slate-400 mt-1 text-sm">Here's your freelancer dashboard</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="📤" label="Applications" value={pendingApps} sub="pending" color="yellow" />
        <StatCard icon="🔄" label="Active Projects" value={activeProjects} color="blue" />
        <StatCard icon="✅" label="Completed" value={completedProjects} color="green" />
        <StatCard icon="💰" label="Total Earned" value={`$${(user.totalEarnings || 0).toLocaleString()}`} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Recent Applications</h2>
            <Link to="/jobs" className="btn-primary text-xs px-3 py-1.5">Find Jobs</Link>
          </div>
          {applications.length === 0 ? <p className="text-slate-500 text-sm">No applications yet.</p> : (
            <div className="space-y-3">
              {applications.slice(0, 5).map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{a.jobId?.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">${a.bidAmount} • {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
          <Link to="/my-applications" className="btn-ghost text-xs mt-3 inline-flex">View all →</Link>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Active Projects</h2>
            <Link to="/my-projects" className="btn-ghost text-xs">View all</Link>
          </div>
          {projects.length === 0 ? <p className="text-slate-500 text-sm">No active projects.</p> : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${p._id}`} className="text-sm font-medium text-slate-200 hover:text-brand-400 block truncate">{p.jobId?.title}</Link>
                    <p className="text-xs text-slate-500 mt-0.5">${p.agreedAmount}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

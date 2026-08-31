import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/common';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsAPI.getMyJobs().then(({ data }) => setJobs(data.jobs)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await jobsAPI.delete(id);
      setJobs(j => j.filter(x => x._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-10">
      <SectionHeader title="My Job Posts" subtitle={`${jobs.length} jobs posted`}
        action={<Link to="/post-job" className="btn-primary text-sm">+ Post New Job</Link>} />
      {jobs.length === 0 ? (
        <EmptyState icon="📋" title="No jobs yet" description="Post your first job to find talented freelancers"
          action={<Link to="/post-job" className="btn-primary">Post a Job</Link>} />
      ) : (
        <div className="space-y-4">
          {jobs.map(j => (
            <div key={j._id} className="card p-5 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link to={`/jobs/${j._id}`} className="font-semibold text-slate-100 hover:text-brand-400 transition-colors">{j.title}</Link>
                    <StatusBadge status={j.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Budget: <span className="text-slate-300">${j.budget?.min?.toLocaleString()}{j.budget?.max ? `–$${j.budget.max.toLocaleString()}` : ''}</span></span>
                    <span>•</span>
                    <span>Deadline: <span className="text-slate-300">{format(new Date(j.deadline), 'MMM d, yyyy')}</span></span>
                    <span>•</span>
                    <span>{j.applicationsCount} applicants</span>
                    <span>•</span>
                    <span>Posted {formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}</span>
                  </div>
                  {j.assignedFreelancer && (
                    <p className="text-xs text-brand-400 mt-1">Assigned to: {j.assignedFreelancer.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {j.status === 'open' && (
                    <Link to={`/jobs/${j._id}/applications`} className="btn-secondary text-xs px-3 py-2">
                      Applications ({j.applicationsCount})
                    </Link>
                  )}
                  <Link to={`/post-job?edit=${j._id}`} className="btn-ghost text-xs px-3 py-2">Edit</Link>
                  <button onClick={() => handleDelete(j._id)} className="btn-ghost text-xs px-3 py-2 text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { StatusBadge, Avatar, PageLoader, EmptyState, SectionHeader } from '../../components/common';
import { format } from 'date-fns';

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getMy().then(({ data }) => setProjects(data.projects)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-10">
      <SectionHeader title="My Projects" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`} />
      {projects.length === 0 ? (
        <EmptyState icon="🔄" title="No projects yet" description="Accept a freelancer application to start a project"
          action={<Link to="/manage-jobs" className="btn-primary">View My Jobs</Link>} />
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <Link to={`/projects/${p._id}`} key={p._id} className="card-hover block p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-100">{p.jobId?.title}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar name={p.freelancerId?.name} src={p.freelancerId?.avatar} size="sm" />
                    <span className="text-sm text-slate-400">{p.freelancerId?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                    <span>Agreed: <span className="text-brand-400 font-medium">${p.agreedAmount?.toLocaleString()}</span></span>
                    <span>Deadline: {format(new Date(p.deadline), 'MMM d, yyyy')}</span>
                    <span>Payment: <StatusBadge status={p.paymentStatus} /></span>
                  </div>
                </div>
                <div className="text-brand-400 text-sm font-medium">View Details →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

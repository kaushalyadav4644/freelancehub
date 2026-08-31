import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/common';
import { format } from 'date-fns';

export default function MyProjectsPage() {
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
        <EmptyState icon="🔄" title="No projects yet" description="Get hired to start working on projects"
          action={<Link to="/jobs" className="btn-primary">Find Jobs</Link>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link to={`/projects/${p._id}`} key={p._id} className="card-hover block p-6 group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors flex-1 mr-2">{p.jobId?.title}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-slate-400 mb-4">Client: {p.clientId?.name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Agreed Amount</p>
                  <p className="font-bold text-brand-400">${p.agreedAmount?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Deadline</p>
                  <p className="font-medium text-slate-200">{format(new Date(p.deadline), 'MMM d')}</p>
                </div>
              </div>
              {p.deliveries?.length > 0 && (
                <p className="text-xs text-slate-500 mt-3">{p.deliveries.length} delivery submission{p.deliveries.length > 1 ? 's' : ''}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

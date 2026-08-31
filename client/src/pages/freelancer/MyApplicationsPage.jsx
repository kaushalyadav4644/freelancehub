import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../../services/api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/common';
import { formatDistanceToNow, format } from 'date-fns';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsAPI.getMy().then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const grouped = {
    pending: applications.filter(a => a.status === 'pending'),
    accepted: applications.filter(a => a.status === 'accepted'),
    rejected: applications.filter(a => a.status === 'rejected'),
  };

  return (
    <div className="page-container py-10 max-w-4xl">
      <SectionHeader title="My Applications" subtitle={`${applications.length} applications submitted`}
        action={<Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>} />

      {applications.length === 0 ? (
        <EmptyState icon="📤" title="No applications yet" description="Browse open jobs and submit your first proposal"
          action={<Link to="/jobs" className="btn-primary">Find Jobs</Link>} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([status, apps]) => apps.length > 0 && (
            <div key={status}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">{status} ({apps.length})</h2>
              <div className="space-y-3">
                {apps.map(a => (
                  <div key={a._id} className="card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/jobs/${a.jobId?._id}`} className="font-semibold text-slate-100 hover:text-brand-400">{a.jobId?.title}</Link>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{a.jobId?.clientId?.name} • {a.jobId?.category?.replace(/-/g, ' ')}</p>
                        <p className="text-sm text-slate-400 line-clamp-2">{a.proposal}</p>
                        <div className="flex gap-4 mt-3 text-xs text-slate-500">
                          <span>Your bid: <span className="text-brand-400 font-medium">${a.bidAmount}</span></span>
                          <span>Delivery: {a.deliveryTime} days</span>
                          <span>Applied {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    {a.status === 'accepted' && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <Link to="/my-projects" className="btn-primary text-sm">View Project →</Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

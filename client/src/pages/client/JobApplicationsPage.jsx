import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../../services/api';
import { Avatar, StarRating, StatusBadge, PageLoader, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

export default function JobApplicationsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    Promise.all([jobsAPI.getOne(id), applicationsAPI.getForJob(id)]).then(([jRes, aRes]) => {
      setJob(jRes.data.job);
      setApplications(aRes.data.applications);
    }).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (appId, status) => {
    setProcessing(appId);
    try {
      await applicationsAPI.updateStatus(appId, status);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      toast.success(`Application ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setProcessing(''); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-10 max-w-4xl">
      <div className="mb-8">
        <Link to="/manage-jobs" className="text-sm text-slate-400 hover:text-brand-400 mb-3 inline-flex items-center gap-1">
          ← Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">{job?.title}</h1>
        <p className="text-slate-400 mt-1 text-sm">{applications.length} application{applications.length !== 1 ? 's' : ''} received</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon="📭" title="No applications yet" description="Applications will appear here once freelancers apply." />
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app._id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar name={app.freelancerId?.name} src={app.freelancerId?.avatar} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/freelancers/${app.freelancerId?._id}`} className="font-semibold text-slate-100 hover:text-brand-400">
                        {app.freelancerId?.name}
                      </Link>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={app.freelancerId?.rating} />
                      <span className="text-xs text-slate-500">({app.freelancerId?.reviewCount} reviews)</span>
                      <span className="text-xs text-slate-500 capitalize">• {app.freelancerId?.experience}</span>
                    </div>
                    {app.freelancerId?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.freelancerId.skills.slice(0, 5).map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-brand-400">${app.bidAmount?.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">in {app.deliveryTime} days</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-sm font-medium text-slate-300 mb-1">Proposal:</p>
                <p className="text-sm text-slate-400 leading-relaxed">{app.proposal}</p>
              </div>

              {app.coverLetter && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-300 mb-1">Cover Letter:</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{app.coverLetter}</p>
                </div>
              )}

              {app.status === 'pending' && job?.status === 'open' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-800">
                  <button onClick={() => updateStatus(app._id, 'accepted')} disabled={processing === app._id}
                    className="btn-primary text-sm px-5">
                    {processing === app._id ? 'Processing…' : '✓ Accept & Hire'}
                  </button>
                  <button onClick={() => updateStatus(app._id, 'rejected')} disabled={processing === app._id}
                    className="btn-danger text-sm px-5">
                    Reject
                  </button>
                  <Link to={`/messages/${app.freelancerId?._id}`} className="btn-secondary text-sm px-5">Message</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

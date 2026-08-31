import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, StatusBadge, StarRating, PageLoader, Modal } from '../../components/common';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState({ proposal: '', bidAmount: '', deliveryTime: '', coverLetter: '' });

  useEffect(() => {
    jobsAPI.getOne(id).then(({ data }) => setJob(data.job)).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsAPI.apply({ jobId: id, ...form });
      toast.success('Application submitted!');
      setApplyOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!job) return <div className="page-container py-20 text-center text-slate-400">Job not found</div>;

  return (
    <div className="page-container py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="card p-7 mb-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{job.views} views</span>
                  <span>•</span>
                  <span>{job.applicationsCount} applicants</span>
                </div>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills?.map(s => <span key={s} className="px-3 py-1 text-sm bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">{s}</span>)}
            </div>

            {/* Description */}
            <div className="prose prose-invert prose-sm max-w-none">
              <h3 className="text-base font-semibold text-slate-200 mb-3">Project Description</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Client Info */}
          {job.clientId && (
            <div className="card p-6">
              <h3 className="text-base font-semibold text-slate-200 mb-4">About the Client</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={job.clientId.name} src={job.clientId.avatar} size="md" />
                <div>
                  <p className="font-medium text-slate-200">{job.clientId.name}</p>
                  {job.clientId.location && <p className="text-sm text-slate-500">{job.clientId.location}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={job.clientId.rating} />
                <span className="text-xs text-slate-500">({job.clientId.reviewCount} reviews)</span>
              </div>
              {job.clientId.bio && <p className="text-sm text-slate-400 line-clamp-3">{job.clientId.bio}</p>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="card p-6 sticky top-24">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Budget</span>
                <span className="font-bold text-brand-400 text-lg">${job.budget?.min?.toLocaleString()}{job.budget?.max ? `–$${job.budget.max.toLocaleString()}` : '+'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Type</span>
                <span className="text-sm text-slate-200 capitalize">{job.budget?.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Deadline</span>
                <span className="text-sm text-slate-200">{format(new Date(job.deadline), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Experience</span>
                <span className="text-sm text-slate-200 capitalize">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Location</span>
                <span className="text-sm text-slate-200">{job.isRemote ? 'Remote' : 'On-site'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Category</span>
                <span className="text-sm text-slate-200 capitalize">{job.category?.replace(/-/g, ' ')}</span>
              </div>
            </div>

            {!user && <Link to="/login" className="btn-primary w-full justify-center">Log In to Apply</Link>}
            {user?.role === 'freelancer' && job.status === 'open' && (
              <button onClick={() => setApplyOpen(true)} className="btn-primary w-full justify-center">Submit Proposal</button>
            )}
            {user?.role === 'client' && user._id === job.clientId?._id && (
              <div className="space-y-2">
                <Link to={`/jobs/${id}/applications`} className="btn-primary w-full justify-center text-sm">View Applications</Link>
                <Link to={`/post-job?edit=${id}`} className="btn-secondary w-full justify-center text-sm">Edit Job</Link>
              </div>
            )}
            {user?.role === 'client' && user._id !== job.clientId?._id && (
              <Link to={`/messages`} className="btn-secondary w-full justify-center">Contact Client</Link>
            )}
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Submit Proposal" size="lg">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="label">Your Bid Amount ($) *</label>
            <input type="number" className="input" placeholder="Enter your bid" value={form.bidAmount} onChange={e => setForm(p => ({ ...p, bidAmount: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Delivery Time (days) *</label>
            <input type="number" className="input" placeholder="How many days to complete?" value={form.deliveryTime} onChange={e => setForm(p => ({ ...p, deliveryTime: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Proposal *</label>
            <textarea className="input min-h-[120px] resize-none" placeholder="Describe your approach, relevant experience, and why you're the right fit…" value={form.proposal} onChange={e => setForm(p => ({ ...p, proposal: e.target.value }))} required rows={5} />
          </div>
          <div>
            <label className="label">Cover Letter (optional)</label>
            <textarea className="input resize-none" placeholder="Additional message to the client…" value={form.coverLetter} onChange={e => setForm(p => ({ ...p, coverLetter: e.target.value }))} rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={applying}>
              {applying ? 'Submitting…' : 'Submit Proposal'}
            </button>
            <button type="button" onClick={() => setApplyOpen(false)} className="btn-secondary px-5">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

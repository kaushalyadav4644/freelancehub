import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, StatusBadge, StarRating, PageLoader, Modal } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    projectsAPI.getOne(id).then(({ data }) => setProject(data.project)).finally(() => setLoading(false));
  }, [id]);

  const refresh = () => projectsAPI.getOne(id).then(({ data }) => setProject(data.project));

  const submitDelivery = async () => {
    setProcessing(true);
    try {
      await projectsAPI.submitDelivery(id, { message: deliveryMsg });
      toast.success('Work submitted for review!');
      setSubmitOpen(false);
      setDeliveryMsg('');
      await refresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const approve = async () => {
    if (!confirm('Approve this delivery and release payment?')) return;
    setProcessing(true);
    try {
      await projectsAPI.approve(id);
      toast.success('Delivery approved! Project completed.');
      await refresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const requestRevision = async () => {
    setProcessing(true);
    try {
      await projectsAPI.requestRevision(id, { feedback: revisionFeedback });
      toast.success('Revision requested');
      setRevisionOpen(false);
      setRevisionFeedback('');
      await refresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const submitReview = async () => {
    setProcessing(true);
    try {
      const isClient = user._id === project.clientId._id;
      await reviewsAPI.create({
        projectId: id,
        revieweeId: isClient ? project.freelancerId._id : project.clientId._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        type: isClient ? 'client-to-freelancer' : 'freelancer-to-client',
      });
      toast.success('Review submitted!');
      setReviewOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <PageLoader />;
  if (!project) return <div className="page-container py-20 text-center text-slate-400">Project not found</div>;

  const isClient = user._id === project.clientId._id || user._id === project.clientId;
  const isFreelancer = user._id === project.freelancerId._id || user._id === project.freelancerId;

  return (
    <div className="page-container py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <div className="flex-1 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-100">{project.jobId?.title}</h1>
                <p className="text-sm text-slate-400 mt-1">Project #{project._id.slice(-8)}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Agreed Amount', value: `$${project.agreedAmount?.toLocaleString()}`, color: 'text-brand-400' },
                { label: 'Deadline', value: format(new Date(project.deadline), 'MMM d, yyyy'), color: 'text-slate-200' },
                { label: 'Payment', value: project.paymentStatus, color: 'text-slate-200' },
                { label: 'Revisions', value: project.revisionCount, color: 'text-slate-200' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className={`font-semibold capitalize ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parties */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-100 mb-4">Project Parties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Client', person: project.clientId, role: 'client' },
                { label: 'Freelancer', person: project.freelancerId, role: 'freelancer' },
              ].map(({ label, person }) => (
                <div key={label} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl">
                  <Avatar name={person?.name} src={person?.avatar} size="md" />
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-medium text-slate-200">{person?.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating rating={person?.rating} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliveries */}
          {project.deliveries?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-100 mb-4">Delivery History</h2>
              <div className="space-y-4">
                {project.deliveries.map((d, i) => (
                  <div key={i} className="border-l-2 border-brand-500/40 pl-4 py-1">
                    <p className="text-xs text-slate-500 mb-1">{format(new Date(d.submittedAt), 'MMM d, yyyy h:mm a')}</p>
                    <p className="text-sm text-slate-300">{d.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-100 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {isFreelancer && ['active', 'revision-requested'].includes(project.status) && (
                <button onClick={() => setSubmitOpen(true)} className="btn-primary">Submit Work</button>
              )}
              {isClient && project.status === 'submitted' && (
                <>
                  <button onClick={approve} disabled={processing} className="btn-primary">✓ Approve & Complete</button>
                  <button onClick={() => setRevisionOpen(true)} className="btn-secondary">Request Revision</button>
                </>
              )}
              {project.status === 'completed' && (
                <button onClick={() => setReviewOpen(true)} className="btn-secondary">Leave Review</button>
              )}
              <Link to={`/messages/${isClient ? project.freelancerId?._id : project.clientId?._id}`} className="btn-secondary">
                Message {isClient ? 'Freelancer' : 'Client'}
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-slate-100 mb-4 text-sm">Job Details</h3>
            {project.jobId && (
              <Link to={`/jobs/${project.jobId._id}`} className="text-brand-400 hover:text-brand-300 text-sm block mb-4">
                View Original Job →
              </Link>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Category</span><span className="text-slate-200 capitalize">{project.jobId?.category?.replace(/-/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Budget Type</span><span className="text-slate-200 capitalize">{project.jobId?.budget?.type}</span></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Delivery Modal */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Work">
        <div className="space-y-4">
          <div>
            <label className="label">Delivery Message *</label>
            <textarea className="input resize-none" rows={5} placeholder="Describe what you've delivered, any notes for the client, and links to your work…" value={deliveryMsg} onChange={e => setDeliveryMsg(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={submitDelivery} disabled={processing || !deliveryMsg} className="btn-primary flex-1 justify-center">
              {processing ? 'Submitting…' : 'Submit for Review'}
            </button>
            <button onClick={() => setSubmitOpen(false)} className="btn-secondary px-5">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Revision Modal */}
      <Modal open={revisionOpen} onClose={() => setRevisionOpen(false)} title="Request Revision">
        <div className="space-y-4">
          <div>
            <label className="label">Feedback *</label>
            <textarea className="input resize-none" rows={4} placeholder="Explain what needs to be changed or improved…" value={revisionFeedback} onChange={e => setRevisionFeedback(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={requestRevision} disabled={processing || !revisionFeedback} className="btn-primary flex-1 justify-center">
              {processing ? 'Sending…' : 'Request Revision'}
            </button>
            <button onClick={() => setRevisionOpen(false)} className="btn-secondary px-5">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Leave a Review">
        <div className="space-y-4">
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                  className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-700'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Comment *</label>
            <textarea className="input resize-none" rows={4} placeholder="Share your experience working with this person…" value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={submitReview} disabled={processing || !reviewForm.comment} className="btn-primary flex-1 justify-center">
              {processing ? 'Submitting…' : 'Submit Review'}
            </button>
            <button onClick={() => setReviewOpen(false)} className="btn-secondary px-5">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

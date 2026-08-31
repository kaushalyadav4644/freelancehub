import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, StarRating, StatusBadge, PageLoader } from '../../components/common';
import { format } from 'date-fns';

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getById(id).then(({ data }) => {
      setFreelancer(data.user);
      setReviews(data.reviews || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!freelancer) return <div className="page-container py-20 text-center text-slate-400">User not found</div>;

  return (
    <div className="page-container py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="card p-6 text-center sticky top-24">
            <Avatar name={freelancer.name} src={freelancer.avatar} size="xl" />
            <h1 className="text-xl font-bold text-slate-100 mt-4">{freelancer.name}</h1>
            {freelancer.location && <p className="text-sm text-slate-500 mt-1">{freelancer.location}</p>}
            <div className="flex items-center justify-center gap-2 mt-3">
              <StarRating rating={freelancer.rating} size="md" />
              <span className="text-sm text-slate-400">({freelancer.reviewCount})</span>
            </div>
            {freelancer.hourlyRate > 0 && (
              <div className="mt-4 py-3 border-t border-slate-800">
                <p className="text-2xl font-bold text-brand-400">${freelancer.hourlyRate}<span className="text-sm text-slate-500 font-normal">/hr</span></p>
              </div>
            )}
            <div className="mt-4 space-y-2 text-sm text-left">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Experience</span>
                <span className="text-slate-200 capitalize">{freelancer.experience}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Jobs Done</span>
                <span className="text-slate-200">{freelancer.completedJobs}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Member Since</span>
                <span className="text-slate-200">{format(new Date(freelancer.createdAt), 'MMM yyyy')}</span>
              </div>
              {freelancer.isVerified && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Status</span>
                  <span className="text-brand-400">✓ Verified</span>
                </div>
              )}
            </div>
            {user && user._id !== id && (
              <Link to={`/messages/${id}`} className="btn-primary w-full justify-center mt-5 text-sm">Send Message</Link>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 space-y-6">
          {freelancer.bio && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-3">About</h2>
              <p className="text-slate-300 leading-relaxed">{freelancer.bio}</p>
            </div>
          )}

          {freelancer.skills?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 text-sm bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}

          {freelancer.portfolio?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Portfolio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freelancer.portfolio.map((item, i) => (
                  <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="font-medium text-slate-200 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-brand-400 text-sm hover:underline">View Project →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Reviews ({reviews.length})</h2>
              <div className="space-y-5">
                {reviews.map(r => (
                  <div key={r._id} className="pb-5 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={r.reviewerId?.name} src={r.reviewerId?.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">{r.reviewerId?.name}</p>
                        <StarRating rating={r.rating} />
                      </div>
                      <span className="ml-auto text-xs text-slate-500">{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

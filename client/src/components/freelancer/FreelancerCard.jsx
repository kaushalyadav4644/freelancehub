import { Link } from 'react-router-dom';
import { Avatar, StarRating } from '../common';

const expColors = { entry: 'badge-green', intermediate: 'badge-blue', expert: 'badge-yellow' };

export default function FreelancerCard({ freelancer }) {
  return (
    <Link to={`/freelancers/${freelancer._id}`} className="card-hover block p-5 group">
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={freelancer.name} src={freelancer.avatar} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors">{freelancer.name}</h3>
          {freelancer.location && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {freelancer.location}
          </p>}
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={freelancer.rating} />
            <span className="text-xs text-slate-500">({freelancer.reviewCount})</span>
            <span className={`badge text-xs ${expColors[freelancer.experience] || 'badge-slate'}`}>{freelancer.experience}</span>
          </div>
        </div>
        {freelancer.hourlyRate > 0 && (
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-brand-400">${freelancer.hourlyRate}</p>
            <p className="text-xs text-slate-500">/hr</p>
          </div>
        )}
      </div>

      {freelancer.bio && <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">{freelancer.bio}</p>}

      {freelancer.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {freelancer.skills.slice(0, 5).map(s => (
            <span key={s} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded-md">{s}</span>
          ))}
          {freelancer.skills.length > 5 && <span className="text-xs text-slate-500 self-center">+{freelancer.skills.length - 5}</span>}
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          {freelancer.completedJobs} jobs done
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          {Number(freelancer.rating).toFixed(1)} rating
        </span>
        {freelancer.isVerified && <span className="text-brand-400 flex items-center gap-0.5">✓ Verified</span>}
      </div>
    </Link>
  );
}

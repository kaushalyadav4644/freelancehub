import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '../common';

const categoryIcons = {
  'web-development': '🌐', 'mobile-development': '📱', design: '🎨',
  writing: '✍️', marketing: '📣', 'data-science': '📊', 'video-audio': '🎬', other: '💼',
};

export default function JobCard({ job }) {
  const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });
  return (
    <Link to={`/jobs/${job._id}`} className="card-hover block p-5 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{categoryIcons[job.category] || '💼'}</span>
          <div>
            <h3 className="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1 leading-snug">{job.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{job.clientId?.name}</p>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 4).map(s => (
            <span key={s} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded-md">{s}</span>
          ))}
          {job.skills.length > 4 && <span className="px-2 py-0.5 text-xs text-slate-500">+{job.skills.length - 4}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm font-semibold text-brand-400">${job.budget?.min?.toLocaleString()}{job.budget?.max ? `–$${job.budget.max.toLocaleString()}` : '+'}</span>
          <span className="text-xs text-slate-500">{job.budget?.type}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.applicationsCount}
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}

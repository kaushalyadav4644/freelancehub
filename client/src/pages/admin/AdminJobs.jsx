import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { StatusBadge, PageLoader, Pagination } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getJobs({ page, limit: 20 });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this job?')) return;
    try {
      await adminAPI.deleteJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Job Management</h1>
          <p className="text-slate-400 mt-1 text-sm">{pagination.total} total jobs</p>
        </div>
        <Link to="/admin" className="btn-ghost text-sm">← Dashboard</Link>
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    {['Job Title', 'Client', 'Budget', 'Category', 'Posted', 'Applications', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {jobs.map(j => (
                    <tr key={j._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]">
                        <Link to={`/jobs/${j._id}`} className="font-medium text-slate-200 hover:text-brand-400 block truncate">{j.title}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{j.clientId?.name}</td>
                      <td className="px-4 py-3 text-brand-400 font-medium whitespace-nowrap">${j.budget?.min?.toLocaleString()}{j.budget?.max ? `–$${j.budget.max.toLocaleString()}` : ''}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap capitalize text-xs">{j.category?.replace(/-/g, ' ')}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{format(new Date(j.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-slate-300 text-center">{j.applicationsCount}</td>
                      <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link to={`/jobs/${j._id}`} className="text-xs px-2.5 py-1 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">View</Link>
                          <button onClick={() => handleDelete(j._id)} className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

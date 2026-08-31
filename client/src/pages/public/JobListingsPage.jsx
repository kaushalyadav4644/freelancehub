import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import JobCard from '../../components/job/JobCard';
import { Pagination, PageLoader, EmptyState } from '../../components/common';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'video-audio', label: 'Video & Audio' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE = [
  { value: '', label: 'Any Level' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

export default function JobListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const filters = {
    category: searchParams.get('category') || '',
    experience: searchParams.get('experience') || '',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    page: Number(searchParams.get('page')) || 1,
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      if (search) params.search = search;
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await jobsAPI.getAll(params);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set('search', search); else p.delete('search');
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">Browse Jobs</h1>
        <p className="text-slate-400">{pagination.total.toLocaleString()} opportunities available</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="card p-5 space-y-6 sticky top-24">
            <form onSubmit={handleSearch}>
              <label className="label">Search</label>
              <div className="flex gap-2">
                <input className="input text-sm" placeholder="Keywords…" value={search} onChange={e => setSearch(e.target.value)} />
                <button type="submit" className="btn-primary px-3 py-2.5 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>

            <div>
              <label className="label">Category</label>
              <select className="input text-sm" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Experience Level</label>
              <select className="input text-sm" value={filters.experience} onChange={e => setFilter('experience', e.target.value)}>
                {EXPERIENCE.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Budget Range ($)</label>
              <div className="flex gap-2">
                <input type="number" className="input text-sm" placeholder="Min" value={filters.minBudget} onChange={e => setFilter('minBudget', e.target.value)} />
                <input type="number" className="input text-sm" placeholder="Max" value={filters.maxBudget} onChange={e => setFilter('maxBudget', e.target.value)} />
              </div>
            </div>

            {(filters.category || filters.experience || filters.minBudget || filters.maxBudget) && (
              <button onClick={() => setSearchParams({})} className="btn-ghost text-sm w-full justify-center text-red-400">Clear Filters</button>
            )}
          </div>
        </aside>

        {/* Job Grid */}
        <div className="flex-1">
          {loading ? (
            <PageLoader />
          ) : jobs.length === 0 ? (
            <EmptyState icon="🔍" title="No jobs found" description="Try adjusting your filters or search term" />
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {jobs.map(j => <JobCard key={j._id} job={j} />)}
              </div>
              <Pagination page={pagination.page} pages={pagination.pages} onPage={p => setFilter('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

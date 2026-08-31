// FreelancersPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import FreelancerCard from '../../components/freelancer/FreelancerCard';
import { Pagination, PageLoader, EmptyState } from '../../components/common';

export function FreelancersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const filters = {
    experience: searchParams.get('experience') || '',
    minRate: searchParams.get('minRate') || '',
    maxRate: searchParams.get('maxRate') || '',
    page: Number(searchParams.get('page')) || 1,
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      if (search) params.search = search;
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await usersAPI.getFreelancers(params);
      setFreelancers(data.freelancers);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [searchParams]);

  useEffect(() => { fetch(); }, [fetch]);

  const setFilter = (k, v) => {
    const p = new URLSearchParams(searchParams);
    if (v) p.set(k, v); else p.delete(k);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">Find Talent</h1>
        <p className="text-slate-400">{pagination.total.toLocaleString()} skilled freelancers available</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="card p-5 space-y-5 sticky top-24">
            <form onSubmit={(e) => { e.preventDefault(); const p = new URLSearchParams(searchParams); if (search) p.set('search', search); else p.delete('search'); setSearchParams(p); }}>
              <label className="label">Search</label>
              <div className="flex gap-2">
                <input className="input text-sm" placeholder="Name or skills…" value={search} onChange={e => setSearch(e.target.value)} />
                <button type="submit" className="btn-primary px-3 py-2.5 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>
            <div>
              <label className="label">Experience</label>
              <select className="input text-sm" value={filters.experience} onChange={e => setFilter('experience', e.target.value)}>
                {[['', 'Any Level'], ['entry', 'Entry'], ['intermediate', 'Intermediate'], ['expert', 'Expert']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Hourly Rate ($)</label>
              <div className="flex gap-2">
                <input type="number" className="input text-sm" placeholder="Min" value={filters.minRate} onChange={e => setFilter('minRate', e.target.value)} />
                <input type="number" className="input text-sm" placeholder="Max" value={filters.maxRate} onChange={e => setFilter('maxRate', e.target.value)} />
              </div>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {loading ? <PageLoader /> : freelancers.length === 0 ? <EmptyState icon="👥" title="No freelancers found" description="Try adjusting filters" /> : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {freelancers.map(f => <FreelancerCard key={f._id} freelancer={f} />)}
              </div>
              <Pagination page={pagination.page} pages={pagination.pages} onPage={p => setFilter('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FreelancersPage;

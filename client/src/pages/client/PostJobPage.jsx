import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/common';
import toast from 'react-hot-toast';

const CATEGORIES = ['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'video-audio', 'other'];

export default function PostJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'web-development',
    skills: '', budget: { type: 'fixed', min: '', max: '' },
    deadline: '', experienceLevel: 'intermediate', isRemote: true, duration: '1-3-months',
  });

  useEffect(() => {
    if (editId) {
      jobsAPI.getOne(editId).then(({ data }) => {
        const j = data.job;
        setForm({ ...j, skills: j.skills?.join(', ') || '', budget: j.budget, deadline: j.deadline?.split('T')[0] || '' });
      });
    }
  }, [editId]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      if (editId) await jobsAPI.update(editId, payload);
      else await jobsAPI.create(payload);
      toast.success(editId ? 'Job updated!' : 'Job posted!');
      navigate('/manage-jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container py-10 max-w-3xl">
      <SectionHeader title={editId ? 'Edit Job' : 'Post a New Job'} subtitle="Describe your project to attract the right talent" />
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Job Title *</label>
            <input className="input" placeholder="e.g. Build a React dashboard for SaaS app" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input min-h-[140px] resize-none" placeholder="Describe the project, deliverables, and any requirements…" value={form.description} onChange={e => set('description', e.target.value)} required rows={6} />
          </div>
          <div>
            <label className="label">Required Skills (comma-separated)</label>
            <input className="input" placeholder="React, Node.js, MongoDB…" value={form.skills} onChange={e => set('skills', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Budget Type</label>
              <select className="input" value={form.budget.type} onChange={e => set('budget', { ...form.budget, type: e.target.value })}>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
            <div>
              <label className="label">Min Budget ($) *</label>
              <input type="number" className="input" placeholder="500" value={form.budget.min} onChange={e => set('budget', { ...form.budget, min: e.target.value })} required />
            </div>
            <div>
              <label className="label">Max Budget ($)</label>
              <input type="number" className="input" placeholder="2000" value={form.budget.max} onChange={e => set('budget', { ...form.budget, max: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Deadline *</label>
              <input type="date" className="input" value={form.deadline} onChange={e => set('deadline', e.target.value)} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select className="input" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={form.duration} onChange={e => set('duration', e.target.value)}>
                <option value="less-than-1-month">Less than 1 month</option>
                <option value="1-3-months">1–3 months</option>
                <option value="3-6-months">3–6 months</option>
                <option value="more-than-6-months">6+ months</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="remote" checked={form.isRemote} onChange={e => set('isRemote', e.target.checked)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="remote" className="text-sm text-slate-300">Remote work allowed</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Saving…' : editId ? 'Update Job' : 'Post Job'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

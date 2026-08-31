import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { Avatar, SectionHeader } from '../../components/common';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    skills: user?.skills?.join(', ') || '',
    hourlyRate: user?.hourlyRate || '',
    experience: user?.experience || 'entry',
    avatar: user?.avatar || '',
  });
  const [portfolio, setPortfolio] = useState(user?.portfolio || []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        portfolio,
      };
      const { data } = await usersAPI.updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const addPortfolioItem = () => setPortfolio(p => [...p, { title: '', description: '', link: '' }]);
  const updatePortfolio = (i, k, v) => setPortfolio(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const removePortfolio = (i) => setPortfolio(p => p.filter((_, idx) => idx !== i));

  return (
    <div className="page-container py-10 max-w-3xl">
      <SectionHeader title="Edit Profile" subtitle="Update your profile information" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview */}
        <div className="card p-6 flex items-center gap-5">
          <Avatar name={form.name} src={form.avatar} size="xl" />
          <div className="flex-1">
            <label className="label">Avatar URL</label>
            <input className="input" placeholder="https://…" value={form.avatar} onChange={e => set('avatar', e.target.value)} />
            <p className="text-xs text-slate-500 mt-1">Paste a direct image URL (Gravatar, Cloudinary, etc.)</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-slate-100 pb-2 border-b border-slate-800">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="New York, USA" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none" rows={4} placeholder="Tell clients about yourself, your expertise, and what you bring to the table…" value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
        </div>

        {/* Freelancer-specific */}
        {user?.role === 'freelancer' && (
          <>
            <div className="card p-6 space-y-5">
              <h3 className="font-semibold text-slate-100 pb-2 border-b border-slate-800">Freelancer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Hourly Rate ($/hr)</label>
                  <input type="number" className="input" placeholder="50" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <select className="input" value={form.experience} onChange={e => set('experience', e.target.value)}>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Skills (comma-separated)</label>
                <input className="input" placeholder="React, Node.js, TypeScript, MongoDB…" value={form.skills} onChange={e => set('skills', e.target.value)} />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="px-2 py-0.5 text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-semibold text-slate-100">Portfolio</h3>
                <button type="button" onClick={addPortfolioItem} className="btn-secondary text-xs px-3 py-1.5">+ Add Item</button>
              </div>
              {portfolio.length === 0 && <p className="text-slate-500 text-sm">No portfolio items yet. Add some to showcase your work!</p>}
              {portfolio.map((item, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Project {i + 1}</span>
                    <button type="button" onClick={() => removePortfolio(i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                  </div>
                  <input className="input text-sm" placeholder="Project title" value={item.title} onChange={e => updatePortfolio(i, 'title', e.target.value)} />
                  <textarea className="input text-sm resize-none" rows={2} placeholder="Brief description" value={item.description} onChange={e => updatePortfolio(i, 'description', e.target.value)} />
                  <input className="input text-sm" placeholder="Project link (https://…)" value={item.link} onChange={e => updatePortfolio(i, 'link', e.target.value)} />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 justify-center py-3" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

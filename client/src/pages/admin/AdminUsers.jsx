import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Avatar, StatusBadge, PageLoader, Pagination } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (role) params.role = role;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, role]);

  const toggleActive = async (userId, isActive) => {
    setProcessing(userId);
    try {
      const { data } = await adminAPI.updateUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed'); }
    finally { setProcessing(''); }
  };

  const toggleVerified = async (userId, isVerified) => {
    setProcessing(userId);
    try {
      const { data } = await adminAPI.updateUser(userId, { isVerified: !isVerified });
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
      toast.success(`User ${!isVerified ? 'verified' : 'unverified'}`);
    } catch { toast.error('Failed'); }
    finally { setProcessing(''); }
  };

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-slate-400 mt-1 text-sm">{pagination.total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="flex gap-2 flex-1">
          <input className="input text-sm flex-1" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="btn-primary px-4 py-2.5 text-sm shrink-0">Search</button>
        </form>
        <select className="input text-sm w-full sm:w-40" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    {['User', 'Role', 'Joined', 'Stats', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatar} size="sm" />
                          <div>
                            <p className="font-medium text-slate-200">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'client' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        <div>Jobs: {u.completedJobs}</div>
                        <div>Rating: {Number(u.rating).toFixed(1)}★</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`badge text-xs ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                          {u.isVerified && <span className="badge badge-blue text-xs">Verified</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleActive(u._id, u.isActive)} disabled={processing === u._id}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-brand-500/30 text-brand-400 hover:bg-brand-500/10'}`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => toggleVerified(u._id, u.isVerified)} disabled={processing === u._id}
                            className="text-xs px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>
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

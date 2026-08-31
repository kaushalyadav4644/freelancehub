import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { StatusBadge, PageLoader, Avatar } from '../../components/common';
import { format } from 'date-fns';

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getPayments()]).then(([sRes, pRes]) => {
      setStats(sRes.data.stats);
      setPayments(pRes.data.payments || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const completedPayments = payments.filter(p => ['completed', 'escrow', 'released'].includes(p.status));
  const totalRevenue = completedPayments.reduce((s, p) => s + p.amount, 0);
  const platformFees = completedPayments.reduce((s, p) => s + (p.platformFee || 0), 0);

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Platform Reports</h1>
          <p className="text-slate-400 mt-1 text-sm">Analytics and transaction history</p>
        </div>
        <Link to="/admin" className="btn-ghost text-sm">← Dashboard</Link>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Gross Volume', value: `$${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-brand-400' },
          { label: 'Platform Revenue (5%)', value: `$${platformFees.toFixed(2)}`, icon: '🏦', color: 'text-blue-400' },
          { label: 'Total Transactions', value: payments.length, icon: '📊', color: 'text-slate-200' },
          { label: 'Avg. Transaction', value: `$${payments.length ? (totalRevenue / payments.length).toFixed(2) : 0}`, icon: '📈', color: 'text-yellow-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0 },
          { label: 'Active Jobs', value: stats?.openJobs || 0 },
          { label: 'Total Projects', value: stats?.totalProjects || 0 },
          { label: 'Completed Projects', value: stats?.completedProjects || 0 },
          { label: 'Client Accounts', value: stats?.clientCount || 0 },
          { label: 'Freelancer Accounts', value: stats?.freelancerCount || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 flex items-center justify-between">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-lg font-bold text-slate-100">{value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">Transaction History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Last 50 transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                {['Date', 'Job', 'Payer', 'Payee', 'Amount', 'Platform Fee', 'Net', 'Gateway', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.map(p => (
                <tr key={p._id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-[120px] truncate text-xs">{p.jobId?.title || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{p.payerId?.name}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{p.payeeId?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-brand-400">${p.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">${p.platformFee?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">${(p.netAmount || p.amount)?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs capitalize">{p.gateway}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

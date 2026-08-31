import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/common';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getMy().then(({ data }) => setPayments(data.payments)).finally(() => setLoading(false));
  }, []);

  const totalIn = payments.filter(p => p.status === 'completed' || p.status === 'released').reduce((s, p) => s + (p.netAmount || p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'escrow').reduce((s, p) => s + p.amount, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-10 max-w-4xl">
      <SectionHeader title="Payments" subtitle="Track your payment history" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Payments', value: payments.length, icon: '📋', color: 'text-slate-200' },
          { label: 'Amount Processed', value: `$${totalIn.toLocaleString()}`, icon: '✅', color: 'text-brand-400' },
          { label: 'In Escrow', value: `$${totalPending.toLocaleString()}`, icon: '🔒', color: 'text-yellow-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" description="Payment history will appear here once transactions are made" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {['Date', 'Job', 'Payer', 'Payee', 'Amount', 'Platform Fee', 'Status', 'Gateway'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-slate-200 max-w-[150px] truncate">{p.jobId?.title || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{p.payerId?.name}</td>
                    <td className="px-4 py-3 text-slate-300">{p.payeeId?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-brand-400">${p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400">${p.platformFee?.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{p.gateway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

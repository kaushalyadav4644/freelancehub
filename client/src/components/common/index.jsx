// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return <div className={`${s} border-2 border-brand-500 border-t-transparent rounded-full animate-spin ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm animate-pulse">Loading…</p>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-3xl">
        {icon || '📭'}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`${sz} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating > 0 && <span className="ml-1 text-xs text-slate-400">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    open: 'badge-green', 'in-progress': 'badge-blue', completed: 'badge-slate',
    cancelled: 'badge-red', pending: 'badge-yellow', accepted: 'badge-green',
    rejected: 'badge-red', active: 'badge-blue', submitted: 'badge-yellow',
    'revision-requested': 'badge-yellow', escrow: 'badge-blue', released: 'badge-green',
  };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status?.replace(/-/g, ' ')}</span>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, src, size = 'md' }) {
  const s = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-2xl' }[size];
  if (src) return <img src={src} alt={name} className={`${s} rounded-full object-cover ring-2 ring-slate-800`} />;
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-brand-500/30 to-emerald-600/30 border border-brand-500/40 flex items-center justify-center font-bold text-brand-400`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="btn-secondary px-3 py-2 disabled:opacity-40 text-sm">← Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-brand-500 text-white' : 'btn-secondary'}`}>{p}</button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} className="btn-secondary px-3 py-2 disabled:opacity-40 text-sm">Next →</button>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = 'green' }) {
  const colors = {
    green: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-100 font-mono">{value}</p>
      <p className="text-sm font-medium text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} card shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

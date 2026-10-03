import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { TradeCard } from '@/components/trades/TradeCard';
import { Select } from '@/components/ui/Select';
import type { TradeStatus } from '@/lib/types';

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All transactions' },
  { value: 'ACTIVE', label: 'Active deals' },
  { value: 'FUNDED', label: 'Escrow secured' },
  { value: 'EVIDENCE_SUBMITTED', label: 'Documents submitted' },
  { value: 'RELEASE_PENDING', label: 'Buyer approval pending' },
  { value: 'RELEASED', label: 'Settled to seller' },
  { value: 'DISPUTED', label: 'Disputed' },
] as const;

export default function TradesList() {
  const { trades, loading } = useTrades();
  const [filter, setFilter] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const filtered = trades.filter((t) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !t.reference.toLowerCase().includes(q) &&
        !t.product.toLowerCase().includes(q) &&
        !t.destination.toLowerCase().includes(q)
      )
        return false;
    }
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE')
      return ['FUNDED', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW', 'RELEASE_PENDING'].includes(t.status);
    return t.status === (filter as TradeStatus);
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tightish text-ink">Property Transactions</h1>
          <p className="mt-1 text-sm text-muted">
            {trades.length} {trades.length === 1 ? 'transaction' : 'transactions'} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/properties" className="btn-outline">
            Browse Properties
          </Link>
          <Link to="/app/trades/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Transaction
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by reference, property, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <Select
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
          className="sm:w-60"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center">
          <p className="text-sm text-muted">No property transactions match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

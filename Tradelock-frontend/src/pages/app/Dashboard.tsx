import { Link } from 'react-router-dom';
import { ArrowRight, Plus, ShieldCheck, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { TradeCard } from '@/components/trades/TradeCard';
import { formatCurrency } from '@/lib/format';

export default function Dashboard() {
  const { trades, loading } = useTrades();

  const activeTrades = trades.filter((t) =>
    ['FUNDED', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW', 'RELEASE_PENDING'].includes(t.status),
  );
  const totalEscrowed = activeTrades.reduce((sum, t) => sum + t.amount, 0);
  const awaitingReview = trades.filter((t) =>
    ['EVIDENCE_SUBMITTED', 'UNDER_REVIEW'].includes(t.status),
  ).length;
  const verifiedDeals = trades.filter((t) => t.aiScore !== undefined && t.aiScore >= 80).length;
  const completed = trades.filter((t) => t.status === 'RELEASED').length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tightish text-ink">Active Transactions</h1>
          <p className="mt-1 text-sm text-muted">
            Monitor every property deal from escrow to deed settlement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/properties" className="btn-outline">
            <Building2 className="h-4 w-4" />
            Browse Properties
          </Link>
          <Link to="/app/trades/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Transaction
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total Escrowed"
          value={formatCurrency(totalEscrowed || 420000)}
          icon={ShieldCheck}
          iconColor="text-ink"
        />
        <MetricCard
          label="Awaiting Review"
          value={String(awaitingReview || 2)}
          icon={Clock}
          iconColor="text-accent-700"
        />
        <MetricCard
          label="Deed Verified"
          value={String(verifiedDeals || 8)}
          icon={Building2}
          iconColor="text-accent-700"
        />
        <MetricCard
          label="Completed Deals"
          value={String(completed || 14)}
          icon={CheckCircle2}
          iconColor="text-success-600"
        />
      </div>

      {/* Recent Transactions List */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Recent Property Deals</h2>
        <Link to="/app/trades" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center">
          <p className="text-sm text-muted">No transactions yet. Browse properties or start your first protected transaction.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link to="/app/properties" className="btn-outline">
              Browse Properties
            </Link>
            <Link to="/app/trades/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Start a Transaction
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {trades.slice(0, 6).map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="mt-3 text-2xl font-bold tnum text-ink">{value}</p>
    </div>
  );
}

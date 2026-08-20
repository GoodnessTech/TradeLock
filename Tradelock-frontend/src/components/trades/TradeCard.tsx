import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Trade } from '@/lib/types';
import { StatusBadge, RecommendationBadge } from '@/components/ui/StatusBadge';
import { shortAddress } from '@/lib/botchain';
import { formatCurrency, formatDateShort, formatNumber } from '@/lib/format';

export function TradeCard({ trade }: { trade: Trade }) {
  return (
    <Link
      to={`/app/trades/${trade.id}`}
      className="group block rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all hover:shadow-card hover:border-ink/15"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <code className="font-mono text-sm font-semibold text-ink">{trade.reference}</code>
            <StatusBadge status={trade.status} />
          </div>
          <p className="mt-2 text-sm text-ink">
            {formatNumber(trade.quantity)} {trade.unit} {trade.product}
          </p>
          <p className="mt-0.5 text-xs text-muted">Deliver to {trade.destination} · by {formatDateShort(trade.deliveryDeadline)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tnum text-lg font-bold text-ink">{formatCurrency(trade.amount)}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{trade.tokenSymbol}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line-soft pt-4 text-xs">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Buyer</p>
          <p className="mt-0.5 font-mono text-ink">{shortAddress(trade.buyer.address)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Supplier</p>
          <p className="mt-0.5 font-mono text-ink">{shortAddress(trade.supplier.address)}</p>
        </div>
      </div>

      {(trade.aiScore !== undefined || trade.aiRecommendation) && (
        <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">AI Score</span>
            {trade.aiScore !== undefined ? (
              <span className="tnum text-sm font-bold text-ink">{trade.aiScore}<span className="text-muted">/100</span></span>
            ) : (
              <span className="font-mono text-xs text-muted">Pending</span>
            )}
            {trade.aiRecommendation && <RecommendationBadge recommendation={trade.aiRecommendation} />}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">
            View trade
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}

      {!trade.aiScore && !trade.aiRecommendation && (
        <div className="mt-4 flex items-center justify-end border-t border-line-soft pt-4">
          <span className="flex items-center gap-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">
            View trade
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}
    </Link>
  );
}

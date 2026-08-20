import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Shield, ExternalLink } from 'lucide-react';
import { useTrade, useReleaseFunds } from '@/hooks/useTrades';
import { TransactionStatusCard } from '@/components/ui/TransactionStatusCard';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { RecommendationBadge } from '@/components/ui/StatusBadge';
import { BOT_CHAIN, feeAmount, netToSupplier, shortAddress, explorerTxUrl } from '@/lib/botchain';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function ReleasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trade, loading } = useTrade(id);
  const { status, release, reset } = useReleaseFunds();

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-48 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted">Trade not found.</p>
        <Link to="/app/trades" className="btn-primary mt-4">Back to trades</Link>
      </div>
    );
  }

  // Success state
  if (status.state === 'SUCCESS') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center animate-scale-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-ghost">
            <Check className="h-7 w-7 text-success-600" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">Funds Released</h2>
          <p className="mt-2 text-sm text-muted">The supplier has been paid on {BOT_CHAIN.name}.</p>

          <div className="mt-6 rounded-xl border border-line-soft bg-paper p-5 text-left">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Trade</span>
                <code className="font-mono text-ink">{trade.reference}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Supplier receives</span>
                <span className="tnum font-semibold text-success-600">{formatCurrency(netToSupplier(trade.amount))}</span>
              </div>
              {status.txHash && (
                <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
                  <span className="text-muted">Transaction</span>
                  <a
                    href={explorerTxUrl(status.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-[11px] text-ink hover:underline"
                  >
                    {shortAddress(status.txHash, 8)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => navigate(`/app/trades/${trade.id}`)} className="btn-primary">
              View Trade
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate('/app/trades')} className="btn-outline">
              All Trades
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fee = feeAmount(trade.amount);
  const net = netToSupplier(trade.amount);

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold tracking-tightish text-ink">Release Funds</h1>
      <p className="mt-1 text-sm text-muted">
        Authorize the smart contract to release escrowed funds to the supplier.
      </p>

      {/* Confirmation panel */}
      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-line bg-paper px-6 py-4">
          <div className="flex items-center justify-between">
            <code className="font-mono text-sm font-semibold text-ink">{trade.reference}</code>
            {trade.aiRecommendation && <RecommendationBadge recommendation={trade.aiRecommendation} />}
          </div>
          <p className="mt-1 text-sm text-muted">
            {trade.product} · {formatCurrency(trade.amount)}
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Escrow</span>
              <span className="tnum font-medium text-ink">{formatCurrency(trade.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Protocol fee ({trade.feeBps / 100}%)</span>
              <span className="tnum text-ink">{formatCurrency(fee)}</span>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-3">
              <span className="font-medium text-ink">Supplier receives</span>
              <span className="tnum text-lg font-bold text-success-600">{formatCurrency(net)}</span>
            </div>
          </div>
        </div>

        {/* AI score reference */}
        {trade.aiScore !== undefined && (
          <div className="flex items-center gap-4 border-t border-line px-6 py-5">
            <ScoreRing value={trade.aiScore} size={80} stroke={6} />
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">AI Score</p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {trade.aiRecommendation === 'RELEASE_FUNDS' ? 'Release recommended' : 'Review recommended'}
              </p>
              {trade.aiConfidence !== undefined && (
                <p className="mt-0.5 text-xs text-muted">Confidence: {trade.aiConfidence}%</p>
              )}
            </div>
          </div>
        )}

        {/* Supplier */}
        <div className="border-t border-line px-6 py-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Supplier</span>
            <code className="font-mono text-ink">{shortAddress(trade.supplier.address)}</code>
          </div>
        </div>
      </div>

      {/* Authorization note */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-line-soft bg-paper p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
        <p className="text-xs text-muted">
          Your wallet will authorize the smart contract to release escrowed funds. This is an onchain transaction on {BOT_CHAIN.name}.
        </p>
      </div>

      {/* Action */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => release(trade.id)}
          disabled={status.state === 'WALLET_CONFIRMATION' || status.state === 'PENDING'}
          className="btn-accent"
        >
          <Check className="h-4 w-4" />
          Approve & Release
        </button>
        <button onClick={() => navigate(`/app/trades/${trade.id}`)} className="btn-ghost">
          Cancel
        </button>
      </div>

      {status.state !== 'IDLE' && (
        <div className="mt-6">
          <TransactionStatusCard status={status} title="Releasing funds" onDismiss={reset} />
        </div>
      )}
    </div>
  );
}

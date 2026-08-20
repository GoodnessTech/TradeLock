import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Brain,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { useTrade, useFundEscrow } from '@/hooks/useTrades';
import { TransactionStatusCard } from '@/components/ui/TransactionStatusCard';
import { StatusBadge, RecommendationBadge } from '@/components/ui/StatusBadge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { shortAddress, explorerTxUrl, BOT_CHAIN, feeAmount, netToSupplier } from '@/lib/botchain';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format';
import type { TradeStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';
import { cn } from '@/lib/cn';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trade, loading } = useTrade(id);
  const { fund: fundEscrow, status: fundStatus, reset: resetFund } = useFundEscrow();

  const handleFund = async () => {
    if (!trade) return;
    await fundEscrow(trade.id);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-8 w-32 animate-pulse rounded bg-ink/10" />
        <div className="mt-6 h-48 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted">Trade not found.</p>
        <Link to="/app/trades" className="btn-primary mt-4">
          Back to trades
        </Link>
      </div>
    );
  }

  const timeline: { status: TradeStatus; label: string; date?: string }[] = [
    { status: 'CREATED', label: STATUS_LABELS.CREATED, date: trade.createdAt },
    { status: 'FUNDED', label: STATUS_LABELS.FUNDED, date: trade.fundedAt },
    { status: 'EVIDENCE_SUBMITTED', label: STATUS_LABELS.EVIDENCE_SUBMITTED, date: trade.evidenceSubmittedAt },
    { status: 'UNDER_REVIEW', label: 'AI Review', date: trade.reviewedAt },
    { status: 'RELEASE_PENDING', label: 'Buyer Approval', date: trade.status === 'RELEASE_PENDING' ? 'Pending' : trade.releasedAt },
    { status: 'RELEASED', label: 'Released', date: trade.releasedAt },
  ];

  const reachedIndex = timeline.findIndex((t) => t.status === trade.status);
  const isDisputed = trade.status === 'DISPUTED';

  const currentIndex = isDisputed ? 4 : reachedIndex;

  return (
    <div className="mx-auto max-w-5xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-ink">{trade.reference}</h1>
            <StatusBadge status={trade.status} />
          </div>
          <p className="mt-2 text-sm text-ink">
            {formatNumber(trade.quantity)} {trade.unit} {trade.product}
          </p>
          <p className="mt-1 text-sm text-muted">
            Deliver to {trade.destination} · by {formatDate(trade.deliveryDeadline)}
          </p>
        </div>
        <div className="text-right">
          <p className="tnum text-3xl font-bold text-ink">{formatCurrency(trade.amount)}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{trade.tokenSymbol}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Timeline */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-base font-semibold text-ink">Trade Timeline</h2>
          <ol className="mt-6 space-y-0">
            {timeline.map((step, i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              const pending = i > currentIndex;
              return (
                <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span
                      className={cn(
                        'absolute left-[15px] top-9 h-full w-px',
                        done ? 'bg-ink/25' : 'bg-line',
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all',
                      done
                        ? 'border-ink bg-ink text-paper'
                        : current
                          ? 'border-accent bg-accent text-ink'
                          : 'border-line bg-surface text-muted',
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : current ? (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    ) : (
                      <span className="font-mono text-[11px] tnum">{i + 1}</span>
                    )}
                  </span>
                  <div className="flex flex-1 items-center justify-between pt-1">
                    <div>
                      <p className={cn('text-sm font-medium', pending ? 'text-muted' : 'text-ink')}>{step.label}</p>
                      {step.date && step.date !== 'Pending' && (
                        <p className="font-mono text-[11px] text-muted">{formatDateTime(step.date)}</p>
                      )}
                      {step.date === 'Pending' && (
                        <p className="font-mono text-[11px] text-accent-700">Pending</p>
                      )}
                    </div>
                    {pending && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Waiting</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {isDisputed && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-ghost p-3">
              <AlertTriangle className="h-4 w-4 text-danger-600" />
              <span className="text-sm text-danger-600">This trade is under dispute. Funds remain locked.</span>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Score */}
          {trade.aiScore !== undefined && (
            <div className="card flex flex-col items-center p-6">
              <p className="eyebrow mb-4">AI Verification</p>
              <ScoreRing value={trade.aiScore} size={140} />
              {trade.aiRecommendation && (
                <div className="mt-4">
                  <RecommendationBadge recommendation={trade.aiRecommendation} />
                </div>
              )}
              {trade.aiConfidence !== undefined && (
                <p className="mt-3 text-xs text-muted">
                  Confidence: <span className="tnum font-medium text-ink">{trade.aiConfidence}%</span>
                </p>
              )}
            </div>
          )}

          {/* Parties */}
          <div className="card p-5">
            <p className="eyebrow mb-3">Parties</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Buyer</span>
                <code className="font-mono text-xs text-ink">{shortAddress(trade.buyer.address)}</code>
              </div>
              <div className="flex items-center justify-between border-t border-line-soft pt-3">
                <span className="text-xs text-muted">Supplier</span>
                <code className="font-mono text-xs text-ink">{shortAddress(trade.supplier.address)}</code>
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="card p-5">
            <p className="eyebrow mb-3">Payment</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Escrow</span>
                <span className="tnum text-ink">{formatCurrency(trade.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fee ({trade.feeBps / 100}%)</span>
                <span className="tnum text-ink">{formatCurrency(feeAmount(trade.amount))}</span>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-2">
                <span className="font-medium text-ink">Supplier receives</span>
                <span className="tnum font-semibold text-success-600">{formatCurrency(netToSupplier(trade.amount))}</span>
              </div>
            </div>
          </div>

          {/* Onchain */}
          {trade.fundTxHash && (
            <div className="card p-5">
              <p className="eyebrow mb-3">Onchain</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Lock className="h-3.5 w-3.5" /> Fund tx
                  </span>
                  <a
                    href={explorerTxUrl(trade.fundTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-[11px] text-ink hover:underline"
                  >
                    {shortAddress(trade.fundTxHash, 6)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {trade.releaseTxHash && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <Shield className="h-3.5 w-3.5" /> Release tx
                    </span>
                    <a
                      href={explorerTxUrl(trade.releaseTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-[11px] text-ink hover:underline"
                    >
                      {shortAddress(trade.releaseTxHash, 6)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {trade.evidenceHash && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <FileText className="h-3.5 w-3.5" /> Evidence hash
                    </span>
                    <code className="font-mono text-[11px] text-muted">{shortAddress(trade.evidenceHash, 6)}</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-8 flex flex-wrap gap-3">
        {trade.status === 'CREATED' && (
          <button
            className="btn-accent"
            onClick={handleFund}
            disabled={fundStatus.state === 'WALLET_CONFIRMATION' || fundStatus.state === 'PENDING'}
          >
            <Lock className="h-4 w-4" />
            Fund Escrow
          </button>
        )}
        {['FUNDED', 'EVIDENCE_SUBMITTED'].includes(trade.status) && (
          <button className="btn-accent" onClick={() => navigate(`/app/trades/${trade.id}/evidence`)}>
            <Upload className="h-4 w-4" />
            Submit Evidence
          </button>
        )}
        {trade.aiScore !== undefined && (
          <button className="btn-outline" onClick={() => navigate(`/app/trades/${trade.id}/review`)}>
            <Brain className="h-4 w-4" />
            View AI Review
          </button>
        )}
        {trade.status === 'RELEASE_PENDING' && (
          <button className="btn-accent" onClick={() => navigate(`/app/trades/${trade.id}/release`)}>
            <ArrowRight className="h-4 w-4" />
            Release Funds
          </button>
        )}
        {['FUNDED', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW', 'RELEASE_PENDING'].includes(trade.status) && (
          <button
            className="btn-outline text-danger-600 border-danger/20 hover:border-danger/40"
            onClick={() => navigate(`/app/disputes?trade=${trade.id}`)}
          >
            <AlertTriangle className="h-4 w-4" />
            Raise Dispute
          </button>
        )}
      </div>

      {fundStatus.state !== 'IDLE' && (
        <div className="mt-6">
          <TransactionStatusCard status={fundStatus} title="Funding escrow" onDismiss={resetFund} />
        </div>
      )}
    </div>
  );
}

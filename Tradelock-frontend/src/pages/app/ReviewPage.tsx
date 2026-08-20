import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Brain, Check, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useTrade, useAIReview } from '@/hooks/useTrades';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { RecommendationBadge } from '@/components/ui/StatusBadge';
import { BOT_CHAIN, shortAddress } from '@/lib/botchain';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { RECOMMENDATION_LABELS } from '@/lib/types';
import type { AICheck, AIFinding } from '@/lib/types';
import { cn } from '@/lib/cn';

const CHECK_STYLES: Record<AICheck['result'], { label: string; cls: string }> = {
  MATCH: { label: 'Match', cls: 'bg-success-ghost text-success-600' },
  MISMATCH: { label: 'Mismatch', cls: 'bg-danger-ghost text-danger-600' },
  PARTIAL: { label: 'Partial', cls: 'bg-accent-ghost text-accent-700' },
  NOT_VERIFIED: { label: 'Not Verified', cls: 'bg-ink/5 text-muted' },
};

const FINDING_STYLES: Record<AIFinding['kind'], { icon: typeof Check; cls: string }> = {
  POSITIVE: { icon: Check, cls: 'text-success-600' },
  WARNING: { icon: Info, cls: 'text-accent-700' },
  ISSUE: { icon: AlertTriangle, cls: 'text-danger-600' },
};

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trade, loading: tradeLoading } = useTrade(id);
  const { review, loading: reviewLoading } = useAIReview(id);

  if (tradeLoading || reviewLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-8 w-32 animate-pulse rounded bg-ink/10" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted">Trade not found.</p>
        <Link to="/app/trades" className="btn-primary mt-4">Back to trades</Link>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="card p-12 text-center">
          <Brain className="mx-auto h-10 w-10 text-muted" />
          <h2 className="mt-4 text-lg font-semibold text-ink">AI review not available</h2>
          <p className="mt-2 text-sm text-muted">
            The AI review will be available once evidence has been submitted and verified.
          </p>
          <button onClick={() => navigate(`/app/trades/${trade.id}/evidence`)} className="btn-primary mt-6">
            Submit Evidence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow mb-2">AI Delivery Review</p>
          <h1 className="text-2xl font-bold tracking-tightish text-ink">
            Verification for <span className="font-mono">{trade.reference}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {formatNumber(trade.quantity)} {trade.unit} {trade.product} · {formatCurrency(trade.amount)}
          </p>
        </div>
        <RecommendationBadge recommendation={review.recommendation} />
      </div>

      {/* Score + summary */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="card flex flex-col items-center p-6">
          <ScoreRing value={review.score} size={140} />
          <div className="mt-4 space-y-1 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Confidence</p>
            <p className="tnum text-lg font-bold text-ink">{review.confidence}%</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent-700" />
            <p className="eyebrow">AI Summary</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink">{review.summary}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line-soft pt-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Recommendation</p>
              <p className="mt-1 text-sm font-semibold text-ink">{RECOMMENDATION_LABELS[review.recommendation]}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Reviewed</p>
              <p className="mt-1 text-sm text-ink">{formatDate(review.reviewedAt)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Model</p>
              <p className="mt-1 font-mono text-xs text-ink">{review.modelVersion}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Signature</p>
              <p className="mt-1 font-mono text-xs text-muted">{review.signature ? shortAddress(review.signature, 8) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured checks */}
      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <p className="eyebrow">Structured Verification</p>
        </div>
        <div className="divide-y divide-line-soft">
          {review.checks.map((check) => {
            const style = CHECK_STYLES[check.result];
            return (
              <div key={check.id} className="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{check.label}</p>
                  {check.detail && <p className="mt-0.5 text-xs text-muted">{check.detail}</p>}
                </div>
                {check.expected && (
                  <div className="text-xs">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Expected</p>
                    <p className="mt-0.5 text-ink">{check.expected}</p>
                  </div>
                )}
                {check.detected && (
                  <div className="text-xs">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Detected</p>
                    <p className="mt-0.5 text-ink">{check.detected}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="tnum font-mono text-[11px] text-muted">{check.confidence}%</span>
                  <span className={cn('rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider', style.cls)}>
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Findings */}
      <div className="mt-6 card p-6">
        <p className="eyebrow mb-4">AI Findings</p>
        <ul className="space-y-2.5">
          {review.findings.map((finding) => {
            const style = FINDING_STYLES[finding.kind];
            const Icon = style.icon;
            return (
              <li key={finding.id} className="flex items-start gap-2.5 text-sm">
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.cls)} />
                <span className="text-ink">{finding.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Important disclaimer */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-line-soft bg-paper p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
        <div>
          <p className="text-sm font-medium text-ink">You remain in control. AI recommends. You authorize.</p>
          <p className="mt-1 text-xs text-muted">
            The AI score is a recommendation, not a guarantee. Review the evidence yourself before approving release.
          </p>
        </div>
      </div>

      {/* Action */}
      {trade.status === 'RELEASE_PENDING' && (
        <div className="mt-8 flex items-center gap-3">
          <button onClick={() => navigate(`/app/trades/${trade.id}/release`)} className="btn-accent">
            <ArrowRight className="h-4 w-4" />
            Release Funds
          </button>
          <button
            onClick={() => navigate(`/app/disputes?trade=${trade.id}`)}
            className="btn-outline text-danger-600 border-danger/20 hover:border-danger/40"
          >
            <AlertTriangle className="h-4 w-4" />
            Raise Dispute
          </button>
        </div>
      )}

      <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-muted">
        Settled on {BOT_CHAIN.name} · Chain {BOT_CHAIN.chainId}
      </p>
    </div>
  );
}

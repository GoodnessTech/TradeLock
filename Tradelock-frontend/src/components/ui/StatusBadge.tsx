import { cn } from '@/lib/cn';
import type { TradeStatus, AIRecommendation } from '@/lib/types';

const STATUS_STYLES: Record<TradeStatus, { dot: string; text: string; bg: string }> = {
  CREATED: { dot: 'bg-muted', text: 'text-muted', bg: 'bg-ink/5' },
  FUNDED: { dot: 'bg-ink', text: 'text-ink', bg: 'bg-ink/5' },
  EVIDENCE_SUBMITTED: { dot: 'bg-accent', text: 'text-accent-700', bg: 'bg-accent-ghost' },
  UNDER_REVIEW: { dot: 'bg-accent', text: 'text-accent-700', bg: 'bg-accent-ghost' },
  RELEASE_PENDING: { dot: 'bg-accent', text: 'text-accent-700', bg: 'bg-accent-ghost' },
  DISPUTED: { dot: 'bg-danger', text: 'text-danger-600', bg: 'bg-danger-ghost' },
  RELEASED: { dot: 'bg-success', text: 'text-success-600', bg: 'bg-success-ghost' },
  REFUNDED: { dot: 'bg-muted', text: 'text-muted', bg: 'bg-ink/5' },
  CANCELLED: { dot: 'bg-muted', text: 'text-muted', bg: 'bg-ink/5' },
};

export function StatusBadge({ status, className }: { status: TradeStatus; className?: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider',
        s.bg,
        s.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function RecommendationBadge({ recommendation }: { recommendation: AIRecommendation }) {
  const map = {
    RELEASE_FUNDS: { label: 'Release Recommended', cls: 'bg-success-ghost text-success-600' },
    REQUEST_REVIEW: { label: 'Review Requested', cls: 'bg-accent-ghost text-accent-700' },
    FLAG_DISPUTE: { label: 'Dispute Flagged', cls: 'bg-danger-ghost text-danger-600' },
  } as const;
  const r = map[recommendation];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider', r.cls)}>
      {r.label}
    </span>
  );
}

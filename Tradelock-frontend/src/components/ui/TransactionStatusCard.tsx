import { Check, Loader2, AlertTriangle, X, ExternalLink } from 'lucide-react';
import type { TransactionStatus } from '@/lib/types';
import { BOT_CHAIN, explorerTxUrl, shortHash } from '@/lib/botchain';

export function TransactionStatusCard({
  status,
  title,
  onDismiss,
}: {
  status: TransactionStatus;
  title: string;
  onDismiss?: () => void;
}) {
  if (status.state === 'IDLE') return null;

  const styles = {
    WALLET_CONFIRMATION: { icon: Loader2, spin: true, color: 'text-ink', bg: 'bg-ink/5', border: 'border-ink/15' },
    PENDING: { icon: Loader2, spin: true, color: 'text-ink', bg: 'bg-ink/5', border: 'border-ink/15' },
    SUCCESS: { icon: Check, spin: false, color: 'text-success-600', bg: 'bg-success-ghost', border: 'border-success/30' },
    FAILURE: { icon: AlertTriangle, spin: false, color: 'text-danger-600', bg: 'bg-danger-ghost', border: 'border-danger/30' },
    REJECTED: { icon: X, spin: false, color: 'text-muted', bg: 'bg-ink/5', border: 'border-ink/15' },
  } as const;

  const s = styles[status.state];
  const Icon = s.icon;
  const headline = {
    WALLET_CONFIRMATION: `${title}…`,
    PENDING: 'Transaction submitted',
    SUCCESS: status.message || 'Complete',
    FAILURE: 'Action failed',
    REJECTED: 'Cancelled',
  }[status.state];

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 animate-scale-in`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.color} ${s.spin ? 'animate-spin' : ''}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${s.color}`}>{headline}</p>
          {status.message && status.state !== 'SUCCESS' && (
            <p className="mt-0.5 text-xs text-muted">{status.message}</p>
          )}
          {status.txHash && (
            <div className="mt-2 flex items-center gap-2">
              <code className="font-mono text-[11px] text-muted">{shortHash(status.txHash, 8)}</code>
              {status.state === 'SUCCESS' && (
                <a
                  href={explorerTxUrl(status.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-ink underline-offset-2 hover:underline"
                >
                  View on BOTScan
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
          {status.error && status.state === 'FAILURE' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] text-muted underline-offset-2 hover:underline">
                Technical details
              </summary>
              <p className="mt-1 font-mono text-[10px] text-muted/80">{status.error}</p>
            </details>
          )}
          {onDismiss && (status.state === 'SUCCESS' || status.state === 'FAILURE' || status.state === 'REJECTED') && (
            <button
              type="button"
              onClick={onDismiss}
              className="mt-2 text-[11px] font-medium text-muted hover:text-ink"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { BOT_CHAIN };

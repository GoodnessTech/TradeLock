import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import { useDisputes, useRaiseDispute, useTrade } from '@/hooks/useTrades';
import { TransactionStatusCard } from '@/components/ui/TransactionStatusCard';
import { shortAddress } from '@/lib/botchain';
import { formatCurrency, formatDate, relativeTime } from '@/lib/format';
import { DISPUTE_REASON_LABELS } from '@/lib/types';
import type { DisputeReason, Dispute } from '@/lib/types';
import { cn } from '@/lib/cn';

const REASON_OPTIONS = Object.entries(DISPUTE_REASON_LABELS).map(([value, label]) => ({ value, label }));

const STATUS_STYLES: Record<Dispute['status'], string> = {
  OPEN: 'bg-danger-ghost text-danger-600',
  UNDER_REVIEW: 'bg-accent-ghost text-accent-700',
  RESOLVED_RELEASE: 'bg-success-ghost text-success-600',
  RESOLVED_REFUND: 'bg-ink/5 text-muted',
};

export default function DisputesPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { disputes, loading } = useDisputes();
  const { raise, status, reset } = useRaiseDispute();
  const preselectedTradeId = params.get('trade');

  const [showForm, setShowForm] = useState(!!preselectedTradeId);
  const [tradeId, setTradeId] = useState(preselectedTradeId ?? '');
  const { trade } = useTrade(tradeId || undefined);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!tradeId || !reason || !description.trim()) return;
    await raise(tradeId, reason, description);
  };

  const success = status.state === 'SUCCESS';

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tightish text-ink">Disputes</h1>
          <p className="mt-1 text-sm text-muted">
            Raise a dispute when evidence doesn't match the agreed terms. Funds remain locked until resolution.
          </p>
        </div>
        {!showForm && !success && (
          <button onClick={() => setShowForm(true)} className="btn-outline">
            <AlertTriangle className="h-4 w-4" />
            Raise Dispute
          </button>
        )}
      </div>

      {/* Raise dispute form */}
      {showForm && !success && (
        <div className="mb-8 card p-6 sm:p-8 animate-scale-in">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h2 className="text-lg font-semibold text-ink">Raise a Dispute</h2>
          <p className="mt-1 text-sm text-muted">
            This will flag the trade and keep funds locked in escrow until the issue is resolved.
          </p>

          <div className="mt-6 space-y-5">
            <Field label="Trade" htmlFor="tradeId" hint="The trade reference this dispute concerns.">
              <input
                id="tradeId"
                className="input font-mono text-sm"
                placeholder="Trade ID or reference"
                value={tradeId}
                onChange={(e) => setTradeId(e.target.value)}
              />
            </Field>

            {trade && (
              <div className="rounded-xl border border-line-soft bg-paper p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{trade.reference}</span>
                  <span className="tnum font-medium text-ink">{formatCurrency(trade.amount)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{trade.product} · Supplier {shortAddress(trade.supplier.address)}</p>
              </div>
            )}

            <Field label="Reason">
              <Select value={reason} onChange={setReason} options={REASON_OPTIONS} placeholder="Select a reason" />
            </Field>

            <Field label="Description" htmlFor="description" hint="Provide details about the issue.">
              <textarea
                id="description"
                className="input min-h-[100px] resize-none"
                placeholder="Explain what went wrong with the delivery…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!tradeId || !reason || !description.trim() || status.state === 'WALLET_CONFIRMATION'}
              className="btn-danger"
            >
              <AlertTriangle className="h-4 w-4" />
              Open Dispute
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>

          {status.state !== 'IDLE' && (
            <div className="mt-6">
              <TransactionStatusCard status={status} title="Opening dispute" onDismiss={reset} />
            </div>
          )}
        </div>
      )}

      {/* Success state */}
      {success && (
        <div className="mb-8 card p-8 text-center animate-scale-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-ghost">
            <AlertTriangle className="h-7 w-7 text-danger-600" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">Dispute Opened</h2>
          <p className="mt-2 text-sm text-muted">Funds remain locked. The trade is now under dispute review.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => { reset(); setShowForm(false); }} className="btn-outline">
              Done
            </button>
            <Link to="/app/trades" className="btn-primary">
              View Trades
            </Link>
          </div>
        </div>
      )}

      {/* Dispute list */}
      <div>
        <p className="eyebrow mb-4">All Disputes</p>

        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl border border-line bg-surface" />
        ) : disputes.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-12 text-center">
            <p className="text-sm text-muted">No disputes. Active trades are proceeding normally.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <Link
                key={d.id}
                to={`/app/trades/${d.tradeId}`}
                className="group block rounded-2xl border border-line bg-surface p-5 transition-all hover:shadow-card hover:border-ink/15"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <code className="font-mono text-sm font-semibold text-ink">{d.tradeReference}</code>
                      <span className={cn('rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider', STATUS_STYLES[d.status])}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink">{DISPUTE_REASON_LABELS[d.reason]}</p>
                    <p className="mt-1 text-xs text-muted line-clamp-2">{d.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Opened</p>
                    <p className="mt-0.5 text-xs text-ink">{relativeTime(d.openedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

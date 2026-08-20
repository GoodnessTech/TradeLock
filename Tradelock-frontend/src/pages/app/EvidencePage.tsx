import { useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Check,
  Package,
  Hash,
  ArrowRight,
  Brain,
} from 'lucide-react';
import { useTrade, useSubmitEvidence } from '@/hooks/useTrades';
import { TransactionStatusCard } from '@/components/ui/TransactionStatusCard';
import { Select, Field } from '@/components/ui/Select';
import { formatFileSize, formatDate } from '@/lib/format';
import { shortAddress } from '@/lib/botchain';
import type { EvidenceFile, EvidenceType } from '@/lib/types';
import { EVIDENCE_TYPE_LABELS } from '@/lib/types';
import { cn } from '@/lib/cn';

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp';
const MAX_SIZE = 10 * 1024 * 1024;

const EVIDENCE_OPTIONS = Object.entries(EVIDENCE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function EvidencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trade, loading } = useTrade(id);
  const { status, hash, submit, reset } = useSubmitEvidence();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [trackingRef, setTrackingRef] = useState('');
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const newFiles: EvidenceFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_SIZE) {
        setError(`${file.name} exceeds the 10 MB limit.`);
        continue;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      const type: EvidenceType = ext === 'pdf' ? 'BILL_OF_LADING' : 'DELIVERY_PHOTO';
      newFiles.push({
        id: Math.random().toString(36).slice(2),
        type,
        label: EVIDENCE_TYPE_LABELS[type],
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const updateFileType = (fileId: string, type: EvidenceType) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, type, label: EVIDENCE_TYPE_LABELS[type] } : f)),
    );
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async () => {
    if (!trade || files.length === 0) return;
    await submit(trade.id, {
      tradeId: trade.id,
      files,
      trackingReference: trackingRef || undefined,
      notes: notes || undefined,
    });
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl"><div className="h-48 animate-pulse rounded-2xl border border-line bg-surface" /></div>;
  }

  if (!trade) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted">Trade not found.</p>
        <Link to="/app/trades" className="btn-primary mt-4">Back to trades</Link>
      </div>
    );
  }

  // Success state
  if (status.state === 'SUCCESS' && hash) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-8 text-center animate-scale-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-ghost">
            <Check className="h-7 w-7 text-success-600" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">Evidence Submitted</h2>
          <p className="mt-2 text-sm text-muted">
            {files.length} {files.length === 1 ? 'document' : 'documents'} submitted for AI review.
          </p>

          <div className="mt-6 rounded-xl border border-line-soft bg-paper p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-muted">
                <Hash className="h-3.5 w-3.5" /> Evidence Package Hash
              </span>
            </div>
            <code className="mt-2 block break-all font-mono text-[11px] text-ink">{hash}</code>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => navigate(`/app/trades/${trade.id}/review`)} className="btn-accent">
              <Brain className="h-4 w-4" />
              View AI Review
            </button>
            <button onClick={() => navigate(`/app/trades/${trade.id}`)} className="btn-outline">
              Back to trade
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold tracking-tightish text-ink">Submit Delivery Evidence</h1>
      <p className="mt-1 text-sm text-muted">
        For trade <code className="font-mono text-ink">{trade.reference}</code> — upload documents and photos for AI verification.
      </p>

      {/* Trade summary */}
      <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Product</p>
          <p className="mt-1 text-sm font-medium text-ink">{trade.product}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Quantity</p>
          <p className="mt-1 text-sm font-medium tnum text-ink">{trade.quantity.toLocaleString()} {trade.unit}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Deadline</p>
          <p className="mt-1 text-sm font-medium text-ink">{formatDate(trade.deliveryDeadline)}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all',
          dragOver ? 'border-accent bg-accent-ghost' : 'border-line bg-surface hover:border-ink/20',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <UploadCloud className={cn('mx-auto h-10 w-10', dragOver ? 'text-accent-700' : 'text-muted')} />
        <p className="mt-3 text-sm font-medium text-ink">Drag and drop files here</p>
        <p className="mt-1 text-xs text-muted">PDF, PNG, JPG, WEBP — up to 10 MB each</p>
        <button type="button" className="btn-outline mt-4 text-xs">Browse files</button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="eyebrow">Uploaded ({files.length})</p>
          {files.map((file) => {
            const isPdf = file.mimeType === 'application/pdf';
            return (
              <div key={file.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', isPdf ? 'bg-ink/5' : 'bg-accent-ghost')}>
                    {isPdf ? <FileText className="h-5 w-5 text-ink" /> : <ImageIcon className="h-5 w-5 text-accent-700" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{file.fileName}</p>
                    <p className="text-xs text-muted">{formatFileSize(file.fileSize)}</p>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-muted hover:text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <Select
                    value={file.type}
                    onChange={(v) => updateFileType(file.id, v as EvidenceType)}
                    options={EVIDENCE_OPTIONS}
                    className="w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking + notes */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Tracking Reference (optional)" htmlFor="tracking">
          <input
            id="tracking"
            className="input"
            placeholder="e.g. MAERSK-7781-44029"
            value={trackingRef}
            onChange={(e) => setTrackingRef(e.target.value)}
          />
        </Field>
        <Field label="Notes (optional)" htmlFor="notes">
          <input
            id="notes"
            className="input"
            placeholder="Additional context for the reviewer"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>

      {/* Submit */}
      <div className="mt-8 flex items-center gap-3">
        <button onClick={handleSubmit} disabled={files.length === 0 || status.state === 'WALLET_CONFIRMATION'} className="btn-accent">
          <Brain className="h-4 w-4" />
          Submit for AI Review
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted">
          {files.length} {files.length === 1 ? 'file' : 'files'} ready
        </span>
      </div>

      {status.state !== 'IDLE' && (
        <div className="mt-6">
          <TransactionStatusCard status={status} title="Submitting evidence" onDismiss={reset} />
        </div>
      )}
    </div>
  );
}

import {
  ShieldCheck,
  FileCheck2,
  UserCheck,
  ClipboardCheck,
  Lock,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';
import type { Property } from '@/lib/types/property';
import { shortAddress, explorerAddressUrl, BOT_CHAIN } from '@/lib/botchain';

interface TradeLockVerificationSectionProps {
  property: Property;
  onRequestDetails?: () => void;
  onScheduleInspection?: () => void;
}

export function TradeLockVerificationSection({
  property,
  onRequestDetails,
  onScheduleInspection,
}: TradeLockVerificationSectionProps) {
  const { verification } = property;

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-line-soft pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-ghost text-success">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p className="eyebrow text-success-600">Onchain Trust Protocol</p>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            TradeLock Verification
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Every listed property undergoes four-vector due diligence before escrow authorization.
            Funds remain locked in programmable smart contracts until deed conveyance is authenticated.
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-success/30 bg-success-ghost/70 px-4 py-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase tracking-wider text-success-600 font-semibold">
                Status: Verified
              </p>
              <p className="text-xs font-bold text-ink">Ready for Protected Escrow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      {property.isDemo && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-paper/70 p-4 text-xs text-muted">
          <Info className="h-4 w-4 shrink-0 text-accent-700 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-ink">Demonstration & Sandbox Asset:</strong>{' '}
            This listing illustrates TradeLock’s real-estate verification protocol and automated escrow settlement
            on BOT Chain Mainnet (Chain ID {BOT_CHAIN.chainId}). Cadastral records and title identifiers are structured
            for testnet and evaluation purposes.
          </div>
        </div>
      )}

      {/* 4 Core Verification Pillars */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Vector 1: Property Verified */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-paper/40 p-5 transition-all hover:bg-paper/70">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-line text-ink">
                <ShieldCheck className="h-4 w-4 text-success" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-ghost px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-success">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>
            <h3 className="mt-3.5 text-base font-semibold text-ink">Property & Cadastral Mapping</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Official survey beacon coordinates matched with state GIS records. Verified 0 overlap disputes or boundary conflicts.
            </p>
          </div>
          <div className="mt-4 border-t border-line-soft pt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Cadastral Survey Plan</p>
            <p className="mt-0.5 font-mono text-xs font-semibold text-ink">{verification.cadastralSurveyNumber}</p>
          </div>
        </div>

        {/* Vector 2: Seller Verified */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-paper/40 p-5 transition-all hover:bg-paper/70">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-line text-ink">
                <UserCheck className="h-4 w-4 text-success" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-ghost px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-success">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>
            <h3 className="mt-3.5 text-base font-semibold text-ink">Seller & Corporate Identity</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Beneficial owner KYC confirmed. Authorized corporate signatory verified via onchain cryptographic attestation.
            </p>
          </div>
          <div className="mt-4 border-t border-line-soft pt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Verified Wallet Signatory</p>
            <p className="mt-0.5 font-mono text-xs font-semibold text-ink">{shortAddress(property.seller.address)}</p>
          </div>
        </div>

        {/* Vector 3: Documents Reviewed */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-paper/40 p-5 transition-all hover:bg-paper/70">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-line text-ink">
                <FileCheck2 className="h-4 w-4 text-success" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-ghost px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-success">
                <CheckCircle2 className="h-3 w-3" />
                Audited
              </span>
            </div>
            <h3 className="mt-3.5 text-base font-semibold text-ink">Title Deeds & Legal Registry</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Audited Certificate of Occupancy, Deed of Assignment, and tax clearances. Free from mortgage liens and court caveats.
            </p>
          </div>
          <div className="mt-4 border-t border-line-soft pt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Deed Registry Authority</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-ink">{verification.registryOffice}</p>
          </div>
        </div>

        {/* Vector 4: Inspection Available */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-paper/40 p-5 transition-all hover:bg-paper/70">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-line text-ink">
                <ClipboardCheck className="h-4 w-4 text-accent-700" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft/70 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink">
                <CheckCircle2 className="h-3 w-3 text-accent-700" />
                Available
              </span>
            </div>
            <h3 className="mt-3.5 text-base font-semibold text-ink">Structural & MEP Survey</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Independent multi-point structural inspection, foundation integrity, and mechanical/electrical compliance certification.
            </p>
          </div>
          <div className="mt-4 border-t border-line-soft pt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Inspected By & Date</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-ink">
              {verification.inspectionAgency} · {verification.lastInspectedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Smart Contract Escrow Lock Box */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Settlement Smart Contract</p>
              <h4 className="text-sm font-semibold text-ink">TradeLock Escrow Vault (BOT Chain 677)</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-paper px-3 py-1.5 font-mono text-xs text-ink border border-line-soft">
              {shortAddress(verification.smartContractEscrowAddress)}
            </code>
            <a
              href={explorerAddressUrl(verification.smartContractEscrowAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost p-2"
              title="View on BOT Chain Explorer"
            >
              <ExternalLink className="h-4 w-4 text-muted" />
            </a>
          </div>
        </div>
      </div>

      {/* Secondary Actions Row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-6">
        <p className="text-xs text-muted">
          Need full cadastral survey plans or want an independent site visit?
        </p>
        <div className="flex items-center gap-2">
          {onRequestDetails && (
            <button onClick={onRequestDetails} type="button" className="btn-outline text-xs px-4 py-2">
              Request Property Details
            </button>
          )}
          {onScheduleInspection && (
            <button onClick={onScheduleInspection} type="button" className="btn-outline text-xs px-4 py-2">
              Schedule Inspection
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

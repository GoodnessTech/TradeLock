import { useEffect, useState } from 'react';
import { ShieldCheck, FileCheck2, Check, ArrowRight, Building2, UserCheck } from 'lucide-react';

const STEPS = [
  { label: 'Buyer', value: 'Agreement Created', detail: 'Terms & inspection window agreed' },
  { label: 'Escrow', value: '$180,000 USDT', detail: 'Funds secured in smart contract vault' },
  { label: 'Property Verification', value: 'C of O Audited', detail: 'Cadastral beacons & title verified' },
  { label: 'Inspection', value: 'Certified Pass', detail: 'Structural & MEP survey submitted' },
  { label: 'Human Review', value: 'Conditions Met', detail: 'Deed conveyance conditions confirmed' },
  { label: 'Buyer Approval', value: 'Authorized', detail: 'Buyer authorizes smart contract release' },
  { label: 'Settlement', value: '$178,200 USDT', detail: 'Net funds released to seller onchain' },
];

export function TradeFlowCard() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent-ghost/40 via-transparent to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-danger/60" />
            <span className="h-2 w-2 rounded-full bg-accent/60" />
            <span className="h-2 w-2 rounded-full bg-success/60" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
            LAGOS-RES-2408 · Property Escrow Flow
          </span>
        </div>

        {/* Property summary */}
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <div className="px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Property</p>
            <p className="mt-1 text-sm font-semibold text-ink truncate">Modern 3 Bed</p>
          </div>
          <div className="px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Location</p>
            <p className="mt-1 text-sm font-semibold text-ink truncate">Lagos, Nigeria</p>
          </div>
          <div className="px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Escrow Price</p>
            <p className="mt-1 text-sm font-semibold tnum text-ink">$180,000</p>
          </div>
        </div>

        {/* Flow steps */}
        <div className="p-6">
          <ol className="relative space-y-0">
            {STEPS.map((step, i) => {
              const done = i < active;
              const current = i === active;
              const last = i === STEPS.length - 1;
              return (
                <li key={step.label} className="relative flex gap-4 pb-4 last:pb-0">
                  {!last && (
                    <span
                      className={`absolute left-[15px] top-8 h-full w-px transition-colors duration-500 ${
                        done ? 'bg-ink/20' : 'bg-line'
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      done
                        ? 'border-ink bg-ink text-paper'
                        : current
                          ? 'border-accent bg-accent text-ink shadow-soft'
                          : 'border-line bg-surface text-muted'
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : current ? (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    ) : (
                      <span className="font-mono text-[11px] tnum">{i + 1}</span>
                    )}
                  </span>
                  <div
                    className={`flex flex-1 items-center justify-between pt-1 transition-all duration-300 ${
                      current ? 'opacity-100' : done ? 'opacity-75' : 'opacity-40'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{step.label}</p>
                      <p className="text-xs text-muted">{step.detail}</p>
                    </div>
                    <span
                      className={`font-mono text-xs font-semibold tnum transition-colors ${
                        done || current ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      {step.value}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Real-estate protocol attestation badge */}
        <div className="flex items-center justify-between border-t border-line bg-paper px-6 py-3.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent-700" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Title Deed & Cadastral Audit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-success" />
            <span className="font-mono text-xs font-semibold text-ink">Verified Freehold</span>
          </div>
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between bg-ink px-6 py-3.5 text-paper">
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Protected Onchain Settlement
          </span>
          <ArrowRight className="h-4 w-4 text-paper/60" />
        </div>
      </div>

      {/* Floating real-estate deed card */}
      <div
        className="absolute -bottom-6 -left-6 hidden w-52 rotate-[-4deg] rounded-xl border border-line bg-surface p-3.5 shadow-card animate-fade-up sm:block"
        style={{ animationDelay: '0.6s' }}
      >
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-success-600" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Title Deed (C of O)</span>
        </div>
        <p className="mt-1 text-xs font-semibold text-ink">BK-4091 · 240 sqm Verified</p>
      </div>
    </div>
  );
}

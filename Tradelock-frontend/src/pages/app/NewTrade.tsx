import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lock, Building2, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { Field, Select } from '@/components/ui/Select';
import { TransactionStatusCard } from '@/components/ui/TransactionStatusCard';
import { useCreateOrder, useFundEscrow } from '@/hooks/useTrades';
import { useWallet } from '@/hooks/WalletContext';
import { feeAmount, netToSupplier, shortAddress } from '@/lib/botchain';
import { formatCurrency } from '@/lib/format';
import type { CreateTradeInput, ProductCategory, Unit } from '@/lib/types';
import { getPropertyById } from '@/lib/data/properties';
import type { Property } from '@/lib/types/property';
import { cn } from '@/lib/cn';

const STEPS = ['Property', 'Transaction Terms', 'Parties', 'Review & Escrow'] as const;

const PROPERTY_TYPES = ['Residential', 'House', 'Duplex', 'Villa', 'Terrace', 'Apartment', 'Penthouse', 'Commercial', 'Land'];
const INSPECTION_WINDOWS = [
  { value: '7', label: '7 Days Inspection Window' },
  { value: '14', label: '14 Days Inspection Window' },
  { value: '21', label: '21 Days Inspection Window' },
  { value: '30', label: '30 Days Inspection Window' },
];

export default function NewTrade() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const wallet = useWallet();
  const { create: createOrder, status: createStatus, reset: resetCreate } = useCreateOrder();
  const { fund: fundEscrow, status: fundStatus, reset: resetFund } = useFundEscrow();
  const [step, setStep] = useState(0);
  const [createdTradeId, setCreatedTradeId] = useState<string | null>(null);

  // Check for linked property
  const propIdFromParam = searchParams.get('propertyId');
  const propertyFromState = (location.state as { property?: Property } | null)?.property;
  const linkedProperty = propertyFromState || (propIdFromParam ? getPropertyById(propIdFromParam) : null);

  const [inspectionWindowDays, setInspectionWindowDays] = useState('14');

  const [form, setForm] = useState<CreateTradeInput>(() => {
    const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0];
    if (linkedProperty) {
      return {
        product: linkedProperty.title,
        category: (linkedProperty.propertyType as ProductCategory) || 'Real Estate',
        quantity: linkedProperty.sizeSqm || 1,
        unit: 'SQM',
        destination: linkedProperty.location,
        deliveryDeadline: futureDate,
        description: `Buyer and seller agree that funds remain protected until property documentation, cadastral beacon verification, and inspection conditions are completed. Title ref: ${linkedProperty.titleDeedRef || 'Verified Freehold'}.`,
        supplierAddress: linkedProperty.seller.address,
        amount: linkedProperty.price,
        tokenSymbol: linkedProperty.tokenSymbol || 'USDT',
        propertyType: linkedProperty.propertyType,
      };
    }
    return {
      product: '',
      category: 'Real Estate',
      quantity: 1,
      unit: 'SQM',
      destination: '',
      deliveryDeadline: futureDate,
      description: 'Buyer and seller agree that funds remain protected until property documentation, inspection, and agreed transaction conditions are completed.',
      supplierAddress: '',
      amount: 0,
      tokenSymbol: 'USDT',
      propertyType: 'Residential',
    };
  });

  useEffect(() => {
    if (linkedProperty && !form.product) {
      const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0];
      setForm({
        product: linkedProperty.title,
        category: (linkedProperty.propertyType as ProductCategory) || 'Real Estate',
        quantity: linkedProperty.sizeSqm || 1,
        unit: 'SQM',
        destination: linkedProperty.location,
        deliveryDeadline: futureDate,
        description: `Buyer and seller agree that funds remain protected until property documentation, cadastral beacon verification, and inspection conditions are completed. Title ref: ${linkedProperty.titleDeedRef || 'Verified Freehold'}.`,
        supplierAddress: linkedProperty.seller.address,
        amount: linkedProperty.price,
        tokenSymbol: linkedProperty.tokenSymbol || 'USDT',
        propertyType: linkedProperty.propertyType,
      });
    }
  }, [linkedProperty]);

  const update = (patch: Partial<CreateTradeInput>) => setForm((f) => ({ ...f, ...patch }));

  const canProceed = () => {
    if (step === 0) {
      return form.product.trim().length > 0 && form.destination.trim().length > 0;
    }
    if (step === 1) {
      return form.amount > 0 && form.deliveryDeadline.length > 0;
    }
    if (step === 2) {
      return form.supplierAddress.startsWith('0x') && form.supplierAddress.length >= 42;
    }
    return true;
  };

  const handleCreate = async () => {
    const trade = await createOrder(form);
    setCreatedTradeId(trade.id);
  };

  const handleFund = async () => {
    if (!createdTradeId) return;
    await fundEscrow(createdTradeId);
  };

  const reset = () => {
    resetCreate();
    resetFund();
    setCreatedTradeId(null);
    setStep(0);
    const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0];
    setForm({
      product: '',
      category: 'Real Estate',
      quantity: 1,
      unit: 'SQM',
      destination: '',
      deliveryDeadline: futureDate,
      description: 'Buyer and seller agree that funds remain protected until property documentation, inspection, and agreed transaction conditions are completed.',
      supplierAddress: '',
      amount: 0,
      tokenSymbol: 'USDT',
      propertyType: 'Residential',
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold tracking-tightish text-ink">Start a Protected Property Transaction</h1>
      <p className="mt-1 text-sm text-muted">
        Set the property, transaction terms, and conditions that must be satisfied before funds are released.
      </p>

      {/* Linked Property Banner */}
      {linkedProperty && !createdTradeId && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-success/30 bg-success-ghost/70 p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-line text-success">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-success-600 font-semibold">
                  Protected Property Escrow
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-success border border-line">
                  <ShieldCheck className="h-3 w-3" /> TradeLock Verified
                </span>
              </div>
              <p className="text-sm font-bold text-ink">{linkedProperty.title}</p>
              <p className="text-xs text-muted">{linkedProperty.location} · {formatCurrency(linkedProperty.price)} {linkedProperty.tokenSymbol}</p>
            </div>
          </div>
          <Link
            to={`/properties/${linkedProperty.id}`}
            className="btn-outline text-xs px-3 py-1.5 hidden sm:inline-flex"
            target="_blank"
          >
            View Listing
          </Link>
        </div>
      )}

      {/* Stepper */}
      {!createdTradeId && (
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm transition-all',
                    i < step
                      ? 'border-ink bg-ink text-paper'
                      : i === step
                        ? 'border-ink bg-surface text-ink'
                        : 'border-line bg-surface text-muted',
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('hidden text-sm sm:block', i === step ? 'font-medium text-ink' : 'text-muted')}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <div className={cn('h-px flex-1', i < step ? 'bg-ink' : 'bg-line')} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Steps */}
      {!createdTradeId && (
        <div className="card p-6 sm:p-8">
          {/* STEP 1: PROPERTY */}
          {step === 0 && (
            <div className="animate-fade-in space-y-5">
              <Field label="Property Title" htmlFor="propertyTitle" hint="The exact property name or address.">
                <input
                  id="propertyTitle"
                  className="input"
                  placeholder="e.g. Modern 3 Bedroom Residence"
                  value={form.product}
                  onChange={(e) => update({ product: e.target.value })}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Property Type">
                  <Select
                    value={form.propertyType || 'Residential'}
                    onChange={(v) => update({ propertyType: v, category: v as ProductCategory })}
                    options={PROPERTY_TYPES}
                  />
                </Field>
                <Field label="Property Size (sqm / area)" htmlFor="size">
                  <input
                    id="size"
                    type="number"
                    min={0}
                    className="input tnum"
                    placeholder="e.g. 240"
                    value={form.quantity || ''}
                    onChange={(e) => update({ quantity: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <Field label="Property Location" htmlFor="location" hint="City, state, country, or specific district.">
                <input
                  id="location"
                  className="input"
                  placeholder="e.g. Lekki Phase 1, Lagos, Nigeria"
                  value={form.destination}
                  onChange={(e) => update({ destination: e.target.value })}
                />
              </Field>
            </div>
          )}

          {/* STEP 2: TRANSACTION TERMS */}
          {step === 1 && (
            <div className="animate-fade-in space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Purchase Price / Escrow Amount" htmlFor="amount" hint="Total purchase funds to lock in escrow.">
                  <input
                    id="amount"
                    type="number"
                    min={0}
                    className="input tnum text-lg"
                    placeholder="180000"
                    value={form.amount || ''}
                    onChange={(e) => update({ amount: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Settlement Currency">
                  <Select
                    value={form.tokenSymbol}
                    onChange={(v) => update({ tokenSymbol: v })}
                    options={['USDT', 'USDC']}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Target Closing Deadline" htmlFor="deadline" hint="Expected date for closing & deed handover.">
                  <input
                    id="deadline"
                    type="date"
                    className="input"
                    value={form.deliveryDeadline}
                    onChange={(e) => update({ deliveryDeadline: e.target.value })}
                  />
                </Field>

                <Field label="Inspection Window" hint="Buyer inspection & survey review window.">
                  <Select
                    value={inspectionWindowDays}
                    onChange={(v) => setInspectionWindowDays(v)}
                    options={INSPECTION_WINDOWS}
                  />
                </Field>
              </div>

              <Field label="Closing Conditions & Notes" htmlFor="description">
                <textarea
                  id="description"
                  className="input min-h-[90px] resize-none"
                  placeholder="Specify deed verification requirements, inspection terms, title release conditions…"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>

              <div className="rounded-xl border border-line-soft bg-paper p-5">
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Purchase Escrow Amount</span>
                    <span className="tnum font-medium text-ink">{formatCurrency(form.amount)} {form.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between border-t border-line-soft pt-2.5">
                    <span className="text-muted">TradeLock Protocol Fee (1%)</span>
                    <span className="tnum text-ink">{formatCurrency(feeAmount(form.amount))} {form.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between border-t border-line-soft pt-2.5">
                    <span className="font-medium text-ink">Seller Receives on Verified Closing</span>
                    <span className="tnum font-semibold text-success-600">
                      {formatCurrency(netToSupplier(form.amount))} {form.tokenSymbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PARTIES */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <div className="rounded-2xl border border-line bg-paper/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Buyer (You)</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink">
                      {wallet.address ? shortAddress(wallet.address) : 'Wallet Not Connected'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-ghost px-2.5 py-1 text-xs font-semibold text-success">
                    <UserCheck className="h-3.5 w-3.5" /> Buyer Account
                  </span>
                </div>
              </div>

              <Field
                label="Seller / Developer Wallet Address"
                htmlFor="seller"
                hint="The EVM address of the property deed owner or accredited developer."
              >
                <input
                  id="seller"
                  className="input font-mono text-sm"
                  placeholder="0x…"
                  value={form.supplierAddress}
                  onChange={(e) => update({ supplierAddress: e.target.value })}
                />
              </Field>

              <div className="rounded-xl border border-line-soft bg-paper p-4 text-xs text-muted">
                Double-check the seller address. Once funds are locked in the smart contract escrow vault,
                the recipient cannot be changed without raising a formal title dispute.
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & ESCROW */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-base font-semibold text-ink">Review Transaction Summary</h3>
                <p className="mt-1 text-sm text-muted">Confirm details before creating the onchain protected transaction.</p>
              </div>

              <dl className="divide-y divide-line-soft rounded-2xl border border-line bg-surface">
                <SummaryRow label="Property" value={form.product} />
                <SummaryRow label="Property Type" value={form.propertyType || 'Residential'} />
                <SummaryRow label="Location" value={form.destination} />
                <SummaryRow label="Purchase Price" value={formatCurrency(form.amount)} />
                <SummaryRow label="Escrow Amount" value={`${formatCurrency(form.amount)} ${form.tokenSymbol}`} />
                <SummaryRow label="Inspection Window" value={`${inspectionWindowDays} Days`} />
                <SummaryRow label="Closing Deadline" value={form.deliveryDeadline} />
                <SummaryRow label="Buyer" value={wallet.address ? shortAddress(wallet.address) : 'Connected Wallet'} mono />
                <SummaryRow label="Seller" value={shortAddress(form.supplierAddress)} mono />
                <SummaryRow label="Protocol Fee (1%)" value={formatCurrency(feeAmount(form.amount))} />
                <SummaryRow label="Seller Receives" value={formatCurrency(netToSupplier(form.amount))} highlight />
              </dl>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="btn-primary">
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleCreate} disabled={createStatus.state === 'WALLET_CONFIRMATION'} className="btn-primary">
                Create Protected Transaction
              </button>
            )}
          </div>

          {createStatus.state !== 'IDLE' && (
            <div className="mt-6">
              <TransactionStatusCard status={createStatus} title="Creating transaction" onDismiss={resetCreate} />
            </div>
          )}
        </div>
      )}

      {/* Fund Escrow Step */}
      {createdTradeId && createStatus.state === 'SUCCESS' && fundStatus.state !== 'SUCCESS' && (
        <div className="mt-8 card p-6 sm:p-8 animate-scale-in">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-ghost">
              <Check className="h-5 w-5 text-success-600" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-ink">Protected Transaction Created</h3>
              <p className="text-sm text-muted">Now fund the escrow vault to lock funds onchain on BOT Chain.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line-soft bg-paper p-5">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Escrow Amount</span>
                <span className="tnum font-medium text-ink">{formatCurrency(form.amount)}</span>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-2.5">
                <span className="text-muted">Settlement Token</span>
                <span className="font-mono text-ink">{form.tokenSymbol}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleFund} disabled={fundStatus.state === 'WALLET_CONFIRMATION' || fundStatus.state === 'PENDING'} className="btn-accent">
              <Lock className="h-4 w-4" />
              Fund Escrow Vault
            </button>
            <button onClick={() => navigate(`/app/trades/${createdTradeId}`)} className="btn-ghost">
              View Transaction
            </button>
          </div>

          {fundStatus.state !== 'IDLE' && (
            <div className="mt-6">
              <TransactionStatusCard status={fundStatus} title="Securing escrow funds" onDismiss={resetFund} />
            </div>
          )}
        </div>
      )}

      {/* Funded Success */}
      {fundStatus.state === 'SUCCESS' && (
        <div className="mt-8 card p-8 text-center animate-scale-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-ghost">
            <Check className="h-7 w-7 text-success-600" />
          </span>
          <h3 className="mt-4 text-xl font-bold text-ink">Escrow Secured Onchain</h3>
          <p className="mt-2 text-sm text-muted">
            Funds are locked in the smart contract escrow vault on BOT Chain. The seller can now submit property deeds and structural survey evidence.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => navigate(`/app/trades/${createdTradeId}`)} className="btn-primary">
              View Transaction Details
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={reset} className="btn-outline">
              Create Another Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd
        className={cn(
          'text-sm',
          mono && 'font-mono',
          highlight ? 'font-semibold text-success-600 tnum' : 'font-medium text-ink',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

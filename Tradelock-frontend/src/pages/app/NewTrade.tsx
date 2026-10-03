import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lock, Building2, ShieldCheck } from 'lucide-react';
import { Field, Select } from '@/components/ui/Select';
import { TransactionStatusCard } from '@/components/ui/TransactionStatusCard';
import { useCreateOrder, useFundEscrow } from '@/hooks/useTrades';
import { feeAmount, netToSupplier, shortAddress } from '@/lib/botchain';
import { formatCurrency } from '@/lib/format';
import type { CreateTradeInput, ProductCategory, Unit } from '@/lib/types';
import { CATEGORY_OPTIONS, UNIT_OPTIONS } from '@/lib/types';
import { getPropertyById } from '@/lib/data/properties';
import type { Property } from '@/lib/types/property';
import { cn } from '@/lib/cn';

const STEPS = ['Trade Details', 'Supplier', 'Payment', 'Review'] as const;

export default function NewTrade() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { create: createOrder, status: createStatus, reset: resetCreate } = useCreateOrder();
  const { fund: fundEscrow, status: fundStatus, reset: resetFund } = useFundEscrow();
  const [step, setStep] = useState(0);
  const [createdTradeId, setCreatedTradeId] = useState<string | null>(null);

  // Check for linked property
  const propIdFromParam = searchParams.get('propertyId');
  const propertyFromState = (location.state as { property?: Property } | null)?.property;
  const linkedProperty = propertyFromState || (propIdFromParam ? getPropertyById(propIdFromParam) : null);

  const [form, setForm] = useState<CreateTradeInput>(() => {
    if (linkedProperty) {
      const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0];
      return {
        product: linkedProperty.title,
        category: 'Real Estate',
        quantity: 1,
        unit: 'UNITS',
        destination: linkedProperty.location,
        deliveryDeadline: futureDate,
        description: `Property Title Escrow: ${linkedProperty.title} (${linkedProperty.location}). Cadastral Survey: ${linkedProperty.verification.cadastralSurveyNumber}. Title Deed: ${linkedProperty.verification.titleDeedType}. Gated smart escrow settlement.`,
        supplierAddress: linkedProperty.seller.address,
        amount: linkedProperty.price,
        tokenSymbol: linkedProperty.tokenSymbol || 'USDT',
      };
    }
    return {
      product: '',
      category: 'Agriculture',
      quantity: 0,
      unit: 'KG',
      destination: '',
      deliveryDeadline: '',
      description: '',
      supplierAddress: '',
      amount: 0,
      tokenSymbol: 'USDT',
    };
  });

  useEffect(() => {
    if (linkedProperty && !form.product) {
      const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0];
      setForm({
        product: linkedProperty.title,
        category: 'Real Estate',
        quantity: 1,
        unit: 'UNITS',
        destination: linkedProperty.location,
        deliveryDeadline: futureDate,
        description: `Property Title Escrow: ${linkedProperty.title} (${linkedProperty.location}). Cadastral Survey: ${linkedProperty.verification.cadastralSurveyNumber}. Title Deed: ${linkedProperty.verification.titleDeedType}. Gated smart escrow settlement.`,
        supplierAddress: linkedProperty.seller.address,
        amount: linkedProperty.price,
        tokenSymbol: linkedProperty.tokenSymbol || 'USDT',
      });
    }
  }, [linkedProperty]);

  const update = (patch: Partial<CreateTradeInput>) => setForm((f) => ({ ...f, ...patch }));

  const canProceed = () => {
    if (step === 0)
      return form.product.trim() && form.quantity > 0 && form.destination.trim() && form.deliveryDeadline;
    if (step === 1) return form.supplierAddress.startsWith('0x') && form.supplierAddress.length >= 42;
    if (step === 2) return form.amount > 0;
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
    setForm({
      product: '',
      category: 'Agriculture',
      quantity: 0,
      unit: 'KG',
      destination: '',
      deliveryDeadline: '',
      description: '',
      supplierAddress: '',
      amount: 0,
      tokenSymbol: 'USDT',
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold tracking-tightish text-ink">Create Purchase Order</h1>
      <p className="mt-1 text-sm text-muted">Set up a protected trade in four steps.</p>

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

      {/* Steps */}
      {!createdTradeId && (
        <div className="card p-6 sm:p-8">
          {step === 0 && (
            <div className="animate-fade-in space-y-5">
              <Field label="Product" htmlFor="product">
                <input
                  id="product"
                  className="input"
                  placeholder="e.g. Cocoa Beans"
                  value={form.product}
                  onChange={(e) => update({ product: e.target.value })}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category">
                  <Select
                    value={form.category}
                    onChange={(v) => update({ category: v as ProductCategory })}
                    options={CATEGORY_OPTIONS}
                  />
                </Field>
                <Field label="Unit">
                  <Select value={form.unit} onChange={(v) => update({ unit: v as Unit })} options={UNIT_OPTIONS} />
                </Field>
              </div>
              <Field label="Quantity" htmlFor="quantity" hint="The exact amount being traded.">
                <input
                  id="quantity"
                  type="number"
                  min={0}
                  className="input tnum"
                  placeholder="0"
                  value={form.quantity || ''}
                  onChange={(e) => update({ quantity: Number(e.target.value) })}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Destination" htmlFor="destination">
                  <input
                    id="destination"
                    className="input"
                    placeholder="e.g. Rotterdam, NL"
                    value={form.destination}
                    onChange={(e) => update({ destination: e.target.value })}
                  />
                </Field>
                <Field label="Delivery Deadline" htmlFor="deadline">
                  <input
                    id="deadline"
                    type="date"
                    className="input"
                    value={form.deliveryDeadline}
                    onChange={(e) => update({ deliveryDeadline: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Description (optional)" htmlFor="description">
                <textarea
                  id="description"
                  className="input min-h-[80px] resize-none"
                  placeholder="Grade, origin, certifications, specs…"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in space-y-5">
              <Field
                label="Supplier Wallet Address"
                htmlFor="supplier"
                hint="The EVM address that will receive payment upon release."
              >
                <input
                  id="supplier"
                  className="input font-mono text-sm"
                  placeholder="0x…"
                  value={form.supplierAddress}
                  onChange={(e) => update({ supplierAddress: e.target.value })}
                />
              </Field>
              <div className="rounded-xl border border-line-soft bg-paper p-4">
                <p className="text-xs text-muted">
                  Double-check the address. Once escrow is funded, the recipient cannot be changed without raising a dispute.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <Field label="Amount" htmlFor="amount" hint="The total to lock in escrow.">
                <input
                  id="amount"
                  type="number"
                  min={0}
                  className="input tnum text-lg"
                  placeholder="0.00"
                  value={form.amount || ''}
                  onChange={(e) => update({ amount: Number(e.target.value) })}
                />
              </Field>
              <Field label="Payment Token">
                <Select value={form.tokenSymbol} onChange={(v) => update({ tokenSymbol: v })} options={['USDT', 'USDC']} />
              </Field>
              <div className="rounded-xl border border-line-soft bg-paper p-5">
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Trade amount</span>
                    <span className="tnum font-medium text-ink">{formatCurrency(form.amount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-line-soft pt-2.5">
                    <span className="text-muted">Protocol fee (1%)</span>
                    <span className="tnum text-ink">{formatCurrency(feeAmount(form.amount))}</span>
                  </div>
                  <div className="flex justify-between border-t border-line-soft pt-2.5">
                    <span className="font-medium text-ink">Supplier receives</span>
                    <span className="tnum font-semibold text-success-600">
                      {formatCurrency(netToSupplier(form.amount))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-base font-semibold text-ink">Review and create</h3>
              <p className="mt-1 text-sm text-muted">Check the details before creating the purchase order.</p>
              <dl className="mt-6 divide-y divide-line-soft rounded-xl border border-line">
                <SummaryRow label="Product" value={`${form.product}`} />
                <SummaryRow label="Category" value={form.category} />
                <SummaryRow label="Quantity" value={`${form.quantity.toLocaleString()} ${form.unit}`} />
                <SummaryRow label="Destination" value={form.destination} />
                <SummaryRow label="Delivery Deadline" value={form.deliveryDeadline} />
                <SummaryRow label="Supplier" value={shortAddress(form.supplierAddress)} mono />
                <SummaryRow label="Amount" value={formatCurrency(form.amount)} />
                <SummaryRow label="Protocol Fee (1%)" value={formatCurrency(feeAmount(form.amount))} />
                <SummaryRow label="Supplier Receives" value={formatCurrency(netToSupplier(form.amount))} highlight />
              </dl>
            </div>
          )}

          {/* Step nav */}
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
                Create Purchase Order
              </button>
            )}
          </div>

          {createStatus.state !== 'IDLE' && (
            <div className="mt-6">
              <TransactionStatusCard status={createStatus} title="Creating order" onDismiss={resetCreate} />
            </div>
          )}
        </div>
      )}

      {/* Fund escrow step */}
      {createdTradeId && createStatus.state === 'SUCCESS' && fundStatus.state !== 'SUCCESS' && (
        <div className="mt-8 card p-6 sm:p-8 animate-scale-in">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-ghost">
              <Check className="h-5 w-5 text-success-600" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-ink">Purchase order created</h3>
              <p className="text-sm text-muted">Now fund the escrow to lock the funds onchain.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line-soft bg-paper p-5">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Escrow amount</span>
                <span className="tnum font-medium text-ink">{formatCurrency(form.amount)}</span>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-2.5">
                <span className="text-muted">Token</span>
                <span className="font-mono text-ink">{form.tokenSymbol}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleFund} disabled={fundStatus.state === 'WALLET_CONFIRMATION' || fundStatus.state === 'PENDING'} className="btn-accent">
              <Lock className="h-4 w-4" />
              Fund Escrow
            </button>
            <button onClick={() => navigate(`/app/trades/${createdTradeId}`)} className="btn-ghost">
              View order
            </button>
          </div>

          {fundStatus.state !== 'IDLE' && (
            <div className="mt-6">
              <TransactionStatusCard status={fundStatus} title="Funding escrow" onDismiss={resetFund} />
            </div>
          )}
        </div>
      )}

      {/* Funded success */}
      {fundStatus.state === 'SUCCESS' && (
        <div className="mt-8 card p-8 text-center animate-scale-in">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-ghost">
            <Check className="h-7 w-7 text-success-600" />
          </span>
          <h3 className="mt-4 text-xl font-bold text-ink">Escrow Funded</h3>
          <p className="mt-2 text-sm text-muted">Funds are locked on BOT Chain. The supplier can now submit delivery evidence.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => navigate(`/app/trades/${createdTradeId}`)} className="btn-primary">
              View Trade
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={reset} className="btn-outline">
              Create Another
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

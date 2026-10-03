import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileCheck2, Brain, Lock, Scale, Zap, Eye, Building2, UserCheck, CheckCircle2 } from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { TradeFlowCard } from '@/components/landing/TradeFlowCard';
import { FeaturedPropertiesSection } from '@/components/landing/FeaturedPropertiesSection';
import { BOT_CHAIN, PROTOCOL_FEE_BPS } from '@/lib/botchain';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingNav />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
          <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
          <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-accent-ghost/30 blur-3xl" />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
              <div className="animate-fade-up">
                <p className="eyebrow mb-6">Onchain Real Estate Escrow Protocol</p>
                <h1 className="text-display font-bold tracking-tighter2 text-ink">
                  Real Estate,
                  <br />
                  <span className="italic font-serif font-normal">secured from offer to ownership.</span>
                </h1>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                  Discover verified properties, protect funds with programmable escrow, and complete transactions with transparent settlement.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to="/properties" className="btn-primary px-6 py-3 text-base">
                    Explore Properties
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how" className="btn-outline px-6 py-3 text-base">
                    See How It Works
                  </a>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success-600" /> Escrow-protected</span>
                  <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-accent-700" /> Deed & Cadastral Verified</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> BOT Chain Settlement</span>
                </div>
              </div>

              <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
                <TradeFlowCard />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="border-t border-line py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-16 max-w-2xl">
              <p className="eyebrow mb-4">How it works</p>
              <h2 className="text-headline font-bold tracking-tightish text-ink">
                Four steps from agreement to settlement.
              </h2>
              <p className="mt-4 text-lg text-muted">
                Every property transaction follows the same protected path — agreement, escrow, verification, and settlement.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
              {[
                { n: '01', t: 'Agreement', d: 'Buyer and seller set transaction terms, purchase price, and inspection window.' },
                { n: '02', t: 'Escrow', d: 'Purchase funds or deposits are secured onchain in a smart contract vault.' },
                { n: '03', t: 'Verification', d: 'Seller submits title deed, cadastral survey, and certified property inspection evidence.' },
                { n: '04', t: 'Settlement', d: 'Buyer authorizes release once all deed and inspection criteria are met. Funds settle to seller.' },
              ].map((s) => (
                <div key={s.n} className="bg-surface p-8">
                  <span className="font-mono text-3xl font-bold tnum text-ink/15">{s.n}</span>
                  <h3 className="mt-4 text-xl font-semibold text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES DISCOVERY */}
        <FeaturedPropertiesSection />

        {/* TRANSACTION CONSOLE PREVIEW */}
        <section id="product" className="border-t border-line bg-ink py-24 text-paper">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-16 max-w-2xl">
              <p className="eyebrow mb-4 text-paper/50">The Transaction Console</p>
              <h2 className="text-headline font-bold tracking-tightish text-paper">
                A transaction console built for serious property deals.
              </h2>
              <p className="mt-4 text-lg text-paper/60">
                Track every property transaction from agreement to settlement. Documents, inspections, escrow, review, and release — all in one place.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-paper/10 bg-ink-600">
              <div className="grid grid-cols-[200px_1fr] min-h-[480px]">
                {/* Sidebar mock */}
                <div className="border-r border-paper/10 p-4 hidden sm:block">
                  <div className="mb-6 flex items-center gap-2 px-2">
                    <span className="h-6 w-6 rounded-md bg-accent" />
                    <span className="text-sm font-semibold text-paper">TradeLock</span>
                  </div>
                  <ul className="space-y-1">
                    {['Overview', 'Properties', 'Transactions', 'New Deal', 'Escrow Vaults', 'Verifications', 'Disputes', 'Settings'].map((item, i) => (
                      <li
                        key={item}
                        className={`rounded-lg px-3 py-2 text-sm ${i === 0 ? 'bg-paper/10 text-paper' : 'text-paper/50'}`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dashboard mock */}
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-paper">Active Transactions</h3>
                    <span className="rounded-full bg-success-ghost px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-success">
                      BOT Chain · 677
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { l: 'TOTAL ESCROWED', v: '$420,000' },
                      { l: 'AWAITING REVIEW', v: '2' },
                      { l: 'VERIFIED', v: '8' },
                      { l: 'COMPLETED', v: '14' },
                    ].map((m) => (
                      <div key={m.l} className="rounded-xl border border-paper/10 bg-ink p-4">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-paper/40">{m.l}</p>
                        <p className="mt-1.5 text-xl font-bold tnum text-paper">{m.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      { ref: 'LAGOS-2408', p: 'Modern 3 Bedroom Residence, Lagos', a: '$180,000', s: 'PROPERTY VERIFICATION', sc: 'Complete' },
                      { ref: 'ABJ-2407', p: 'Luxury 4 Bedroom Duplex, Abuja', a: '$320,000', s: 'INSPECTION', sc: 'Pending' },
                    ].map((t) => (
                      <div key={t.ref} className="flex items-center justify-between rounded-xl border border-paper/10 bg-ink p-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <code className="font-mono text-xs text-accent shrink-0">{t.ref}</code>
                          <span className="text-sm text-paper/80 truncate">{t.p}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="tnum text-sm font-medium text-paper">{t.a}</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50 hidden sm:inline">{t.s}</span>
                          <span className="font-mono text-xs font-bold text-accent">{t.sc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/app" className="btn-accent px-6 py-3">
                Open the Transaction Console
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOR BUYERS / FOR SELLERS */}
        <section className="border-t border-line py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-2" id="buyers">
              <div className="rounded-3xl border border-line bg-surface p-10">
                <p className="eyebrow mb-4">For Property Buyers</p>
                <h3 className="text-2xl font-bold tracking-tightish text-ink">You control the release.</h3>
                <p className="mt-3 text-muted leading-relaxed">
                  Funds remain protected in onchain smart contract escrow until you are fully satisfied. Independent cadastral audits and certified structural inspections give you complete clarity — but final disbursement requires your authorized signature.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    'Purchase funds secured by programmable smart contract escrow',
                    'Audited cadastral survey and independent structural inspection',
                    "Pause settlement or raise a dispute if title conditions aren't met",
                    'Zero funds move without your direct cryptographic authorization',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-ink">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-line bg-surface p-10" id="sellers">
                <p className="eyebrow mb-4">For Property Sellers & Developers</p>
                <h3 className="text-2xl font-bold tracking-tightish text-ink">Guaranteed settlement on closing.</h3>
                <p className="mt-3 text-muted leading-relaxed">
                  Eliminate buyer financing delays and default risks. Verified buyers lock complete purchase funds or earnest deposits into smart escrow before you convey deeds or transfer physical possession.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    'Verified onchain proof of funds before executing contracts',
                    'Submit deed of assignment and survey pack directly into escrow',
                    'Instant onchain settlement when closing conditions are met',
                    'Transparent, immutable closing records on BOT Chain',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-ink">
                      <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY / TRUST */}
        <section id="security" className="border-t border-line bg-surface py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-16 max-w-2xl">
              <p className="eyebrow mb-4">Trust & Security</p>
              <h2 className="text-headline font-bold tracking-tightish text-ink">
                Trust, engineered for property.
              </h2>
              <p className="mt-4 text-lg text-muted">
                Programmable escrow vaults, hashed title deeds, and certified inspection attestations — settlement on BOT Chain.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {[
                { icon: Lock, t: 'Funds secured in smart escrow', d: 'Escrow holds buyer funds until deed conveyance is authorized. No party can withdraw unilaterally.' },
                { icon: FileCheck2, t: 'Title deeds hashed for integrity', d: 'Every deed and cadastral survey pack is hashed onchain to ensure absolute tamper resistance.' },
                { icon: Brain, t: 'AI-assisted document analysis', d: 'Verification models check cadastral beacons, deed consistency, and structural compliance.' },
                { icon: Eye, t: 'Buyer controls release', d: 'AI and surveyors recommend. The buyer approves. No unauthorized settlement.' },
                { icon: Scale, t: 'Cadastral records verified', d: 'Deed plans cross-referenced with state GIS registers with 0 boundary conflict.' },
                { icon: Zap, t: 'Settlement on BOT Chain', d: 'Final property closing executes with sub-cent gas fees on BOT Chain Mainnet.' },
              ].map((item) => (
                <div key={item.t} className="bg-paper p-8">
                  <item.icon className="h-6 w-6 text-ink" />
                  <h3 className="mt-4 text-base font-semibold text-ink">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOT CHAIN */}
        <section className="border-t border-line py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="rounded-3xl border border-line bg-surface p-10 sm:p-16">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="eyebrow mb-4">Powered by</p>
                  <h2 className="text-3xl font-bold tracking-tightish text-ink">BOT Chain</h2>
                  <p className="mt-3 text-muted leading-relaxed">
                    Low-cost, transparent onchain settlement for protected property transactions. EVM compatible with instantaneous transaction finality.
                  </p>
                  <a
                    href={BOT_CHAIN.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-2 hover:underline"
                  >
                    Explore BOTScan
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                  <div className="bg-paper p-6 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Network</p>
                    <p className="mt-2 text-lg font-bold text-ink">{BOT_CHAIN.network}</p>
                  </div>
                  <div className="bg-paper p-6 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Chain ID</p>
                    <p className="mt-2 text-lg font-bold tnum text-ink">{BOT_CHAIN.chainId}</p>
                  </div>
                  <div className="bg-paper p-6 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Settlement Gas</p>
                    <p className="mt-2 text-lg font-bold text-ink">{BOT_CHAIN.nativeToken.symbol}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUSINESS MODEL */}
        <section id="business" className="border-t border-line bg-surface py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="eyebrow mb-4">Business</p>
                <h2 className="text-headline font-bold tracking-tightish text-ink">
                  A transparent trust layer for real estate.
                </h2>
                <p className="mt-4 text-lg text-muted">
                  TradeLock charges a small protocol fee on completed transactions. No subscription fees, no opaque attorney escrow commissions.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-8">
                <p className="eyebrow mb-6">Example Settlement</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-line-soft pb-4">
                    <span className="text-sm text-muted">Property purchase price</span>
                    <span className="tnum text-2xl font-bold text-ink">$180,000</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line-soft pb-4">
                    <span className="text-sm text-muted">Protocol fee ({PROTOCOL_FEE_BPS / 100}%)</span>
                    <span className="tnum text-xl font-semibold text-ink">$1,800</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">Seller receives on closing</span>
                    <span className="tnum text-2xl font-bold text-success-600">$178,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-line bg-ink py-24 text-paper">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <p className="eyebrow mb-6 text-paper/50">Ready to secure a deal?</p>
            <h2 className="text-display font-bold tracking-tighter2 text-paper">
              Create your first
              <br />
              <span className="italic font-serif font-normal">protected property transaction.</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/app/trades/new" className="btn-accent px-6 py-3 text-base">
                Start a Protected Transaction
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/properties" className="btn border border-paper/20 px-6 py-3 text-base text-paper hover:scale-95 active:scale-90 hover:bg-paper/5">
                Explore Properties
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

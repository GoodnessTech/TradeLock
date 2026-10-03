import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileCheck2, Brain, Lock, Scale, Zap, Eye, Building2 } from 'lucide-react';
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
                <p className="eyebrow mb-6">Onchain Real Estate & Trade Escrow</p>
                <h1 className="text-display font-bold tracking-tighter2 text-ink">
                  Trade without
                  <br />
                  <span className="italic font-serif font-normal">blind trust.</span>
                </h1>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                  Deed-audited real estate discovery and AI-powered programmable escrow for high-value commerce.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to="/properties" className="btn-primary px-6 py-3 text-base">
                    Browse Properties
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/app/trades/new" className="btn-outline px-6 py-3 text-base">
                    Start a Trade
                  </Link>
                </div>
                <div className="mt-10 flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success-600" /> Escrow-protected</span>
                  <span className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-accent-700" /> AI-verified</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> BOT Chain</span>
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
                Four steps from order to settlement.
              </h2>
              <p className="mt-4 text-lg text-muted">
                Every trade follows the same protected path — create, fund, verify, release.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
              {[
                { n: '01', t: 'Create', d: 'Buyer creates a purchase order with product, quantity, and delivery terms.' },
                { n: '02', t: 'Escrow', d: 'Funds are locked onchain in a programmable smart contract.' },
                { n: '03', t: 'Verify', d: 'Supplier submits delivery evidence. AI checks it against the order.' },
                { n: '04', t: 'Release', d: 'Buyer approves. The smart contract pays the supplier.' },
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

        {/* PRODUCT PREVIEW */}
        <section id="product" className="border-t border-line bg-ink py-24 text-paper">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-16 max-w-2xl">
              <p className="eyebrow mb-4 text-paper/50">The Trade Console</p>
              <h2 className="text-headline font-bold tracking-tightish text-paper">
                A console built for serious trade.
              </h2>
              <p className="mt-4 text-lg text-paper/60">
                Track every trade from creation to settlement. AI reviews, evidence, and release — all in one place.
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
                    {['Overview', 'Trades', 'Purchase Orders', 'Escrow', 'AI Reviews', 'Disputes', 'Settings'].map((item, i) => (
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
                    <h3 className="text-lg font-semibold text-paper">Active Trades</h3>
                    <span className="rounded-full bg-success-ghost px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-success">
                      BOT Chain · 677
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { l: 'Total escrowed', v: '$42,500' },
                      { l: 'Awaiting review', v: '2' },
                      { l: 'AI verified', v: '8' },
                      { l: 'Completed', v: '14' },
                    ].map((m) => (
                      <div key={m.l} className="rounded-xl border border-paper/10 bg-ink p-4">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-paper/40">{m.l}</p>
                        <p className="mt-1.5 text-xl font-bold tnum text-paper">{m.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      { ref: 'COCOA-2408', p: '10,000 KG Cocoa', a: '$18,000', s: 'AI REVIEW COMPLETE', sc: '94/100' },
                      { ref: 'STEEL-2407', p: '120 Tons Steel Coils', a: '$15,600', s: 'EVIDENCE SUBMITTED', sc: '—' },
                    ].map((t) => (
                      <div key={t.ref} className="flex items-center justify-between rounded-xl border border-paper/10 bg-ink p-4">
                        <div className="flex items-center gap-4">
                          <code className="font-mono text-xs text-accent">{t.ref}</code>
                          <span className="text-sm text-paper/70">{t.p}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="tnum text-sm font-medium text-paper">{t.a}</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50">{t.s}</span>
                          <span className="tnum text-sm font-bold text-accent">{t.sc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/app" className="btn-accent px-6 py-3">
                Open the Trade Console
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOR BUYERS / FOR SUPPLIERS */}
        <section className="border-t border-line py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-2" id="buyers">
              <div className="rounded-3xl border border-line bg-surface p-10">
                <p className="eyebrow mb-4">For Buyers</p>
                <h3 className="text-2xl font-bold tracking-tightish text-ink">You control the release.</h3>
                <p className="mt-3 text-muted">
                  Funds are locked in escrow until you're satisfied. AI gives you a verification score — but the final authority is always yours.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {['Funds protected by smart contract escrow', 'AI verification before you approve', "Raise a dispute if evidence doesn't match", 'No funds move without your signature'].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-ink">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-line bg-surface p-10" id="suppliers">
                <p className="eyebrow mb-4">For Suppliers</p>
                <h3 className="text-2xl font-bold tracking-tightish text-ink">Get paid on delivery.</h3>
                <p className="mt-3 text-muted">
                  Submit your delivery evidence and let AI verify it. No more chasing invoices or waiting for promised wire transfers.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {['Submit documents and photos in one package', 'AI checks evidence against the order', 'Onchain settlement when the buyer approves', 'Transparent, auditable process'].map((item) => (
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
                Trust, engineered.
              </h2>
              <p className="mt-4 text-lg text-muted">
                Programmable escrow, hashed evidence, and AI-signed recommendations — settlement on BOT Chain.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {[
                { icon: Lock, t: 'Funds locked by smart contract', d: 'Escrow holds buyer funds until release is authorized. No party can move them unilaterally.' },
                { icon: FileCheck2, t: 'Evidence hashed for integrity', d: 'Every evidence package is hashed. Tampering is detectable onchain.' },
                { icon: Brain, t: 'AI recommendations are signed', d: 'Verification scores and recommendations carry a cryptographic signature.' },
                { icon: Eye, t: 'Buyer controls release', d: 'AI recommends. The buyer authorizes. No automatic settlement.' },
                { icon: Scale, t: 'Documents remain offchain', d: 'Large files stay offchain. Only hashes and metadata settle on BOT Chain.' },
                { icon: Zap, t: 'Settlement on BOT Chain', d: 'Final release executes as an EVM transaction on a low-cost, fast network.' },
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
                  <p className="mt-3 text-muted">
                    Low-cost settlement. EVM compatible. Fast onchain execution.
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
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Gas</p>
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
                  A simpler trust layer for global trade.
                </h2>
                <p className="mt-4 text-lg text-muted">
                  TradeLock charges a small transaction fee on completed trades. No subscriptions, no hidden costs.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-8">
                <p className="eyebrow mb-6">Example</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-line-soft pb-4">
                    <span className="text-sm text-muted">Trade amount</span>
                    <span className="tnum text-2xl font-bold text-ink">$18,000</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-line-soft pb-4">
                    <span className="text-sm text-muted">Protocol fee ({PROTOCOL_FEE_BPS / 100}%)</span>
                    <span className="tnum text-xl font-semibold text-ink">$180</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">Supplier receives</span>
                    <span className="tnum text-2xl font-bold text-success-600">$17,820</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-line bg-ink py-24 text-paper">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <p className="eyebrow mb-6 text-paper/50">Ready to trade?</p>
            <h2 className="text-display font-bold tracking-tighter2 text-paper">
              Create your first
              <br />
              <span className="italic font-serif font-normal">protected transaction.</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/app/trades/new" className="btn-accent px-6 py-3 text-base">
                Start a Trade
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/app" className="btn border border-paper/20 px-6 py-3 text-base text-paper hover:scale-95 active:scale-90 hover:bg-paper/5">
                Explore Product
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { LogoLockup } from '@/components/ui/Logo';
import { BOT_CHAIN } from '@/lib/botchain';

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <LogoLockup mark="h-8 w-8 text-ink" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Trade without blind trust. AI-powered verification and programmable escrow for real-world commerce.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#how" className="text-muted hover:text-ink">How it works</a></li>
              <li><a href="#product" className="text-muted hover:text-ink">Trade Console</a></li>
              <li><a href="#security" className="text-muted hover:text-ink">Security</a></li>
              <li><Link to="/app" className="text-muted hover:text-ink">Open app</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Resources</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#business" className="text-muted hover:text-ink">Pricing</a></li>
              <li><a href="#" className="text-muted hover:text-ink">Docs</a></li>
              <li><a href="#" className="text-muted hover:text-ink">GitHub</a></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">BOT Chain</p>
            <ul className="space-y-2.5 text-sm">
              <li className="text-muted">Mainnet · {BOT_CHAIN.chainId}</li>
              <li>
                <a
                  href={BOT_CHAIN.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-ink"
                >
                  Explorer →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            © 2026 TradeLock · All rights reserved
          </p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Settled on {BOT_CHAIN.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

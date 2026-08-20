import { useState, useRef, useEffect } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, Zap, AlertCircle } from 'lucide-react';
import { useWalletContext as useWallet } from '@/hooks/WalletContext';
import { BOT_CHAIN, shortAddress } from '@/lib/botchain';
import { cn } from '@/lib/cn';

export function WalletButton({ variant = 'landing' }: { variant?: 'landing' | 'app' }) {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!wallet.address) {
    return (
      <button onClick={wallet.connect} disabled={wallet.connecting} className="btn-primary">
        <Wallet className="h-4 w-4" />
        {wallet.connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    );
  }

  const wrongNetwork = !wallet.isCorrectNetwork;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all hover:scale-95 active:scale-90',
          wrongNetwork
            ? 'border-danger/30 bg-danger-ghost text-danger-600'
            : 'border-ink/15 bg-surface text-ink hover:border-ink/30',
        )}
      >
        {wrongNetwork ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
        )}
        <span className="font-mono text-xs tnum">{shortAddress(wallet.address)}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift animate-scale-in">
          <div className="border-b border-line p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Connected Wallet</span>
              {wallet.isDemo && (
                <span className="rounded-full bg-accent-ghost px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-700">
                  Preview
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate font-mono text-xs text-ink">{wallet.address}</code>
              <button
                onClick={() => navigator.clipboard?.writeText(wallet.address!)}
                className="text-muted hover:text-ink"
                aria-label="Copy address"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="border-b border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow">Network</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider',
                  wrongNetwork ? 'text-danger-600' : 'text-success-600',
                )}
              >
                {wrongNetwork ? 'Wrong network' : `${BOT_CHAIN.network} ${BOT_CHAIN.chainId}`}
              </span>
            </div>
            {wrongNetwork && (
              <button onClick={wallet.switchNetwork} className="btn-outline w-full text-xs">
                <Zap className="h-3.5 w-3.5" />
                Switch to {BOT_CHAIN.name}
              </button>
            )}
          </div>

          <div className="border-b border-line p-4">
            <span className="eyebrow">Balances</span>
            <dl className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted">{BOT_CHAIN.nativeToken.symbol}</dt>
                <dd className="tnum font-medium text-ink">
                  {wallet.botBalance !== null ? wallet.botBalance.toFixed(4) : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted">{wallet.tokenSymbol}</dt>
                <dd className="tnum font-medium text-ink">
                  {wallet.tokenBalance !== null ? wallet.tokenBalance.toLocaleString() : '—'}
                </dd>
              </div>
            </dl>
            {(wallet.botBalance === null || wallet.tokenBalance === null) && (
              <p className="mt-2 text-[11px] text-muted">
                Balances load from BOT Chain after wallet connection.
              </p>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                wallet.disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-ink/5 hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

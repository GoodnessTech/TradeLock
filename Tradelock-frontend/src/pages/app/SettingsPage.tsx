import { useWalletContext } from '@/hooks/WalletContext';
import { useTradeData } from '@/lib/contracts/TradeDataContext';
import { BOT_CHAIN, shortAddress } from '@/lib/botchain';
import { Copy, Check, Zap, AlertCircle, Shield, FileText, Brain } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export default function SettingsPage() {
  const wallet = useWalletContext();
  const { mode } = useTradeData();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard?.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tightish text-ink">Settings</h1>
      <p className="mt-1 text-sm text-muted">Manage your wallet, network, and TradeLock configuration.</p>

      {/* Wallet */}
      <section className="mt-8 card p-6">
        <p className="eyebrow mb-4">Connected Wallet</p>
        {wallet.address ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm text-ink">{wallet.address}</code>
                <button onClick={copyAddress} className="text-muted hover:text-ink" aria-label="Copy address">
                  {copied ? <Check className="h-3.5 w-3.5 text-success-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              {wallet.isDemo && (
                <span className="rounded-full bg-accent-ghost px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-700">
                  Preview
                </span>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-line-soft pt-4 text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">BOT Balance</dt>
                <dd className="mt-1 tnum font-medium text-ink">{wallet.botBalance !== null ? wallet.botBalance.toFixed(4) : '—'}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{wallet.tokenSymbol} Balance</dt>
                <dd className="mt-1 tnum font-medium text-ink">{wallet.tokenBalance !== null ? wallet.tokenBalance.toLocaleString() : '—'}</dd>
              </div>
            </dl>
            <button onClick={wallet.disconnect} className="btn-ghost text-danger-600">
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted">No wallet connected.</p>
            <button onClick={wallet.connect} className="btn-primary mt-3">
              Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* Network */}
      <section className="mt-4 card p-6">
        <p className="eyebrow mb-4">Network</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">{BOT_CHAIN.name} {BOT_CHAIN.network}</p>
            <p className="mt-0.5 font-mono text-xs text-muted">Chain ID {BOT_CHAIN.chainId}</p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider',
              wallet.isCorrectNetwork ? 'bg-success-ghost text-success-600' : 'bg-danger-ghost text-danger-600',
            )}
          >
            {wallet.isCorrectNetwork ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {wallet.isCorrectNetwork ? 'Connected' : 'Wrong network'}
          </span>
        </div>
        {!wallet.isCorrectNetwork && wallet.address && (
          <button onClick={wallet.switchNetwork} className="btn-outline mt-4 text-xs">
            <Zap className="h-3.5 w-3.5" />
            Switch to {BOT_CHAIN.name}
          </button>
        )}
      </section>

      {/* Protocol info */}
      <section className="mt-4 card p-6">
        <p className="eyebrow mb-4">Protocol & Contracts</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted">
              <Shield className="h-4 w-4" /> Data provider
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-ink">
              {mode === 'mock' ? 'Preview (mock)' : 'BOT Chain Mainnet (677)'}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-line-soft pt-3">
            <span className="flex items-center gap-2 text-muted">
              <Brain className="h-4 w-4" /> AI Oracle Signer
            </span>
            <a
              href={`https://scan.botchain.ai/address/0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ink hover:underline"
            >
              {shortAddress('0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51', 6)}
            </a>
          </div>
          <div className="flex items-center justify-between border-t border-line-soft pt-3">
            <span className="flex items-center gap-2 text-muted">
              <Shield className="h-4 w-4" /> TradeLock Escrow
            </span>
            <a
              href={`https://scan.botchain.ai/address/${BOT_CHAIN.escrowAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ink hover:underline"
            >
              {shortAddress(BOT_CHAIN.escrowAddress, 6)}
            </a>
          </div>
          <div className="flex items-center justify-between border-t border-line-soft pt-3">
            <span className="flex items-center gap-2 text-muted">
              <Zap className="h-4 w-4" /> USDt Token (6 dec)
            </span>
            <a
              href={`https://scan.botchain.ai/address/${BOT_CHAIN.settlementToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ink hover:underline"
            >
              {shortAddress(BOT_CHAIN.settlementToken.address, 6)}
            </a>
          </div>
          <div className="flex items-center justify-between border-t border-line-soft pt-3">
            <span className="flex items-center gap-2 text-muted">
              <FileText className="h-4 w-4" /> Evidence storage
            </span>
            <span className="font-mono text-xs text-ink">EIP-712 Verified & Hashed</span>
          </div>
        </div>
      </section>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-muted">
        TradeLock · Settled on {BOT_CHAIN.name}
      </p>
    </div>
  );
}

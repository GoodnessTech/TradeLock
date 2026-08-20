import { useWalletContext as useWallet } from '@/hooks/WalletContext';
import { BOT_CHAIN } from '@/lib/botchain';
import { AlertCircle, Zap } from 'lucide-react';

export function NetworkBanner() {
  const wallet = useWallet();
  if (!wallet.address || wallet.isCorrectNetwork) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-b border-danger/20 bg-danger-ghost px-4 py-2.5 text-sm">
      <AlertCircle className="h-4 w-4 shrink-0 text-danger-600" />
      <span className="text-danger-600">
        Switch to {BOT_CHAIN.name} {BOT_CHAIN.network} to continue.
      </span>
      {wallet.hasInjected && (
        <button
          onClick={wallet.switchNetwork}
          className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white hover:scale-95 active:scale-90"
        >
          <Zap className="h-3 w-3" />
          Switch network
        </button>
      )}
    </div>
  );
}

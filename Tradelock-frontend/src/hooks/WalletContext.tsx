import { createContext, useContext, type ReactNode } from 'react';
import { useWallet } from './useWallet';

const WalletCtx = createContext<ReturnType<typeof useWallet> | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return <WalletCtx.Provider value={wallet}>{children}</WalletCtx.Provider>;
}

export function useWalletContext() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}

export { useWalletContext as useWallet };

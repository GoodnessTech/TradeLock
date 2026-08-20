import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TradeDataProvider } from '@/lib/contracts/provider';
import { BlockchainTradeDataProvider } from '@/lib/contracts/blockchainProvider';

type ProviderMode = 'mock' | 'blockchain';

interface TradeDataCtx {
  provider: TradeDataProvider;
  mode: ProviderMode;
}

const Ctx = createContext<TradeDataCtx | null>(null);

export function TradeDataProvider({ children }: { children: ReactNode }) {
  const value = useMemo<TradeDataCtx>(() => {
    return { provider: BlockchainTradeDataProvider, mode: 'blockchain' };
  }, []);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTradeData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTradeData must be used within TradeDataProvider');
  return ctx;
}

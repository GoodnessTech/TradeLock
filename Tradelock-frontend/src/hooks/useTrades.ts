import { useCallback, useEffect, useState } from 'react';
import type {
  Trade,
  AIReview,
  EvidencePackage,
  Dispute,
  CreateTradeInput,
  TransactionStatus,
} from '@/lib/types';
import { useTradeData } from '@/lib/contracts/TradeDataContext';

export function useTrades() {
  const { provider } = useTradeData();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await provider.listTrades();
      setTrades(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trades.');
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { trades, loading, error, refresh };
}

export function useTrade(id: string | undefined) {
  const { provider } = useTradeData();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) {
      setTrade(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    provider
      .getTrade(id)
      .then((t) => {
        if (active) setTrade(t);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load trade.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [provider, id]);

  return { trade, loading, error, setTrade };
}

export function useCreateOrder() {
  const { provider } = useTradeData();
  const [status, setStatus] = useState<TransactionStatus>({ state: 'IDLE' });

  const create = useCallback(
    async (input: CreateTradeInput) => {
      setStatus({ state: 'WALLET_CONFIRMATION', message: 'Preparing property transaction…' });
      try {
        const trade = await provider.createTrade({
          product: input.product,
          category: input.category,
          quantity: input.quantity,
          unit: input.unit,
          destination: input.destination,
          deliveryDeadline: input.deliveryDeadline,
          description: input.description,
          supplier: { address: input.supplierAddress },
          amount: input.amount,
          tokenSymbol: input.tokenSymbol,
        });
        setStatus({ state: 'SUCCESS', message: 'Protected property transaction created.' });
        return trade;
      } catch (e) {
        setStatus({
          state: 'FAILURE',
          error: e instanceof Error ? e.message : 'Could not create property transaction.',
        });
        throw e;
      }
    },
    [provider],
  );

  const reset = useCallback(() => setStatus({ state: 'IDLE' }), []);
  return { status, create, reset };
}

export function useFundEscrow() {
  const { provider } = useTradeData();
  const [status, setStatus] = useState<TransactionStatus>({ state: 'IDLE' });

  const fund = useCallback(
    async (tradeId: string) => {
      setStatus({ state: 'WALLET_CONFIRMATION', message: 'Waiting for wallet confirmation' });
      try {
        const { txHash } = await provider.fundEscrow(tradeId);
        setStatus({ state: 'PENDING', txHash, message: 'Confirming on BOT Chain…' });
        await new Promise((r) => setTimeout(r, 1200));
        setStatus({ state: 'SUCCESS', txHash, message: 'Escrow funded.' });
        return txHash;
      } catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('denied')) {
          setStatus({ state: 'REJECTED', message: 'Transaction cancelled in wallet.' });
        } else {
          setStatus({ state: 'FAILURE', error: 'Trade could not be funded. No funds were moved.' });
        }
        throw e;
      }
    },
    [provider],
  );

  const reset = useCallback(() => setStatus({ state: 'IDLE' }), []);
  return { status, fund, reset };
}

export function useSubmitEvidence() {
  const { provider } = useTradeData();
  const [status, setStatus] = useState<TransactionStatus>({ state: 'IDLE' });
  const [hash, setHash] = useState<string | null>(null);

  const submit = useCallback(
    async (tradeId: string, pkg: Omit<EvidencePackage, 'hash' | 'submittedAt'>) => {
      setStatus({ state: 'WALLET_CONFIRMATION', message: 'Hashing evidence package…' });
      try {
        const result = await provider.submitEvidence(tradeId, pkg);
        setHash(result.hash);
        setStatus({ state: 'SUCCESS', message: 'Evidence submitted for AI review.' });
        return result;
      } catch (e) {
        setStatus({ state: 'FAILURE', error: 'Evidence could not be submitted.' });
        throw e;
      }
    },
    [provider],
  );

  const reset = useCallback(() => {
    setStatus({ state: 'IDLE' });
    setHash(null);
  }, []);
  return { status, hash, submit, reset };
}

export function useEvidence(tradeId: string | undefined) {
  const { provider } = useTradeData();
  const [evidence, setEvidence] = useState<EvidencePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!tradeId) {
      setEvidence(null);
      setLoading(false);
      return;
    }
    provider
      .getEvidence(tradeId)
      .then((e) => active && setEvidence(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [provider, tradeId]);

  return { evidence, loading };
}

export function useAIReview(tradeId: string | undefined) {
  const { provider } = useTradeData();
  const [review, setReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!tradeId) {
      setReview(null);
      setLoading(false);
      return;
    }
    provider
      .getAIReview(tradeId)
      .then((r) => active && setReview(r))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [provider, tradeId]);

  return { review, loading };
}

export function useReleaseFunds() {
  const { provider } = useTradeData();
  const [status, setStatus] = useState<TransactionStatus>({ state: 'IDLE' });

  const release = useCallback(
    async (tradeId: string) => {
      setStatus({ state: 'WALLET_CONFIRMATION', message: 'Waiting for wallet confirmation' });
      try {
        const { txHash } = await provider.releaseFunds(tradeId);
        setStatus({ state: 'PENDING', txHash, message: 'Confirming on BOT Chain…' });
        await new Promise((r) => setTimeout(r, 1400));
        setStatus({ state: 'SUCCESS', txHash, message: 'Funds released.' });
        return txHash;
      } catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('denied')) {
          setStatus({ state: 'REJECTED', message: 'Transaction cancelled in wallet.' });
        } else {
          setStatus({ state: 'FAILURE', error: 'Funds could not be released. No funds were moved.' });
        }
        throw e;
      }
    },
    [provider],
  );

  const reset = useCallback(() => setStatus({ state: 'IDLE' }), []);
  return { status, release, reset };
}

export function useRaiseDispute() {
  const { provider } = useTradeData();
  const [status, setStatus] = useState<TransactionStatus>({ state: 'IDLE' });

  const raise = useCallback(
    async (tradeId: string, reason: string, description: string) => {
      setStatus({ state: 'WALLET_CONFIRMATION', message: 'Opening dispute…' });
      try {
        const { disputeId } = await provider.raiseDispute(tradeId, reason, description);
        setStatus({ state: 'SUCCESS', message: 'Dispute opened. Funds remain locked.' });
        return disputeId;
      } catch (e) {
        setStatus({ state: 'FAILURE', error: 'Could not open dispute.' });
        throw e;
      }
    },
    [provider],
  );

  const reset = useCallback(() => setStatus({ state: 'IDLE' }), []);
  return { status, raise, reset };
}

export function useDisputes() {
  const { provider } = useTradeData();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    provider
      .listDisputes()
      .then((d) => active && setDisputes(d))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [provider]);

  return { disputes, loading };
}

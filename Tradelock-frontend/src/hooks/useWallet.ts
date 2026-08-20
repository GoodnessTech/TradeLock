import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BOT_CHAIN } from '@/lib/botchain';
import { ERC20_ABI } from '@/lib/contracts/abi';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

const STORAGE_KEY = 'tradelock_wallet';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [botBalance, setBotBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [hasInjected, setHasInjected] = useState(false);

  const isCorrectNetwork = chainId === BOT_CHAIN.chainId;

  // Refresh real onchain balances (native BOT and payment token)
  const refreshBalances = useCallback(async (accountAddress: string | null) => {
    if (!accountAddress || !ethers.isAddress(accountAddress)) {
      setBotBalance(null);
      setTokenBalance(null);
      return;
    }

    try {
      // Use window.ethereum if available, otherwise direct RPC
      let provider: ethers.Provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(BOT_CHAIN.rpcUrl, BOT_CHAIN.chainId);
      }

      // 1. Fetch Native BOT Balance
      const rawBotBal = await provider.getBalance(accountAddress);
      const formattedBot = parseFloat(ethers.formatEther(rawBotBal));
      setBotBalance(formattedBot);

      // 2. Fetch Payment Token (USDt) Balance if token address is set
      if (BOT_CHAIN.settlementToken.address && ethers.isAddress(BOT_CHAIN.settlementToken.address)) {
        try {
          const tokenContract = new ethers.Contract(
            BOT_CHAIN.settlementToken.address,
            ERC20_ABI,
            provider,
          );
          const rawTokenBal = await tokenContract.balanceOf(accountAddress);
          const decimals = BOT_CHAIN.settlementToken.decimals || 6;
          const formattedToken = parseFloat(ethers.formatUnits(rawTokenBal, decimals));
          setTokenBalance(formattedToken);
        } catch (tokErr) {
          console.warn('[TradeLock Wallet] Token balance query notice:', tokErr);
          setTokenBalance(0);
        }
      }
    } catch (e) {
      console.warn('[TradeLock Wallet] Balance fetch notice:', e);
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth) {
      setConnecting(true);
      // No injected wallet — enter preview mode
      const demo = '0x72F4C1aB29dE8A5E3f0c2D1b9a4F6e0C7b3A91d2';
      sessionStorage.setItem(STORAGE_KEY, demo);
      setAddress(demo);
      setChainId(BOT_CHAIN.chainId);
      setConnecting(false);
      refreshBalances(demo);
      return;
    }
    try {
      setConnecting(true);
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      const id = (await eth.request({ method: 'eth_chainId' })) as string;
      const parsedChainId = parseInt(id, 16);
      const primaryAccount = accounts[0] ?? null;

      setAddress(primaryAccount);
      setChainId(parsedChainId);

      if (primaryAccount) {
        sessionStorage.setItem(STORAGE_KEY, primaryAccount);
        await refreshBalances(primaryAccount);
      }

      // Auto-prompt network switch if on wrong chain
      if (parsedChainId !== BOT_CHAIN.chainId) {
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BOT_CHAIN.chainIdHex }],
          });
        } catch (switchErr) {
          const code = (switchErr as { code?: number }).code;
          if (code === 4902) {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: BOT_CHAIN.chainIdHex,
                  chainName: `${BOT_CHAIN.name} ${BOT_CHAIN.network}`,
                  nativeCurrency: BOT_CHAIN.nativeToken,
                  rpcUrls: [BOT_CHAIN.rpcUrl],
                  blockExplorerUrls: [BOT_CHAIN.explorerUrl],
                },
              ],
            });
          }
        }
      }
    } catch (err) {
      console.error('[TradeLock Wallet] Connect error:', err);
    } finally {
      setConnecting(false);
    }
  }, [refreshBalances]);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAddress(null);
    setChainId(null);
    setBotBalance(null);
    setTokenBalance(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth) return;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BOT_CHAIN.chainIdHex }],
      });
      setChainId(BOT_CHAIN.chainId);
      if (address) refreshBalances(address);
    } catch (e) {
      const code = (e as { code?: number }).code;
      if (code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BOT_CHAIN.chainIdHex,
              chainName: `${BOT_CHAIN.name} ${BOT_CHAIN.network}`,
              nativeCurrency: BOT_CHAIN.nativeToken,
              rpcUrls: [BOT_CHAIN.rpcUrl],
              blockExplorerUrls: [BOT_CHAIN.explorerUrl],
            },
          ],
        });
        setChainId(BOT_CHAIN.chainId);
        if (address) refreshBalances(address);
      }
    }
  }, [address, refreshBalances]);

  useEffect(() => {
    const eth = window.ethereum;
    setHasInjected(!!eth);

    const initWallet = async () => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (eth) {
        try {
          const accounts = (await eth.request({ method: 'eth_accounts' })) as string[];
          const id = (await eth.request({ method: 'eth_chainId' })) as string;
          const currentChainId = parseInt(id, 16);
          setChainId(currentChainId);

          if (accounts && accounts.length > 0) {
            const activeAcc = accounts[0];
            setAddress(activeAcc);
            sessionStorage.setItem(STORAGE_KEY, activeAcc);
            refreshBalances(activeAcc);
          } else if (stored) {
            setAddress(stored);
            refreshBalances(stored);
          }
        } catch (e) {
          console.warn('[TradeLock Wallet] Initial account check notice:', e);
        }
      } else if (stored) {
        setAddress(stored);
        setChainId(BOT_CHAIN.chainId);
        refreshBalances(stored);
      }
    };

    initWallet();

    if (!eth) return;

    const onAccounts = (...args: unknown[]) => {
      const accs = args[0] as string[];
      const newAddr = accs?.[0] ?? null;
      setAddress(newAddr);
      if (newAddr) {
        sessionStorage.setItem(STORAGE_KEY, newAddr);
        refreshBalances(newAddr);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        setBotBalance(null);
        setTokenBalance(null);
      }
    };

    const onChain = (...args: unknown[]) => {
      const id = args[0] as string;
      const newChainId = parseInt(id, 16);
      setChainId(newChainId);
      if (address) refreshBalances(address);
    };

    eth.on?.('accountsChanged', onAccounts);
    eth.on?.('chainChanged', onChain);

    return () => {
      eth.removeListener?.('accountsChanged', onAccounts);
      eth.removeListener?.('chainChanged', onChain);
    };
  }, [address, refreshBalances]);

  return {
    address,
    chainId,
    connecting,
    botBalance,
    tokenBalance,
    tokenSymbol: BOT_CHAIN.settlementToken.symbol,
    isCorrectNetwork,
    hasInjected,
    isDemo: !hasInjected && !!address,
    connect,
    disconnect,
    switchNetwork,
    refreshBalances: () => refreshBalances(address),
  };
}

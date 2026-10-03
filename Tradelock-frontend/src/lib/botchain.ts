export const BOT_CHAIN = {
  name: 'BOT Chain',
  network: 'Mainnet',
  chainId: Number(import.meta.env.VITE_BOT_CHAIN_ID || 677),
  chainIdHex: '0x2a5',
  rpcUrl: import.meta.env.VITE_BOT_RPC_URL || 'https://rpc.botchain.ai',
  explorerUrl: import.meta.env.VITE_BOT_EXPLORER_URL || 'https://scan.botchain.ai',
  nativeToken: {
    symbol: 'BOT',
    name: 'BOT',
    decimals: 18,
  },
  // Settlement token (USDt) on BOT Chain Mainnet (Chain ID 677)
  settlementToken: {
    symbol: 'USDT',
    name: 'TradeLock USD',
    decimals: 6,
    address: (import.meta.env.VITE_PAYMENT_TOKEN_ADDRESS ||
      '0x0E965EAe12631A0826518e1811df9953355995fF') as `0x${string}`,
  },
} as const;

export const TRADELOCK_CONTRACT = {
  address: (import.meta.env.VITE_TRADELOCK_ESCROW_ADDRESS ||
    '0xd77d14697bCC9D0a6DCA234b8612D3C0A5ae89eb') as `0x${string}`,
  explorerUrl: BOT_CHAIN.explorerUrl,
} as const;

export const PROTOCOL_CONFIG = {
  aiOracleAddress: (import.meta.env.VITE_AI_ORACLE_ADDRESS ||
    '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51') as `0x${string}`,
  treasuryAddress: (import.meta.env.VITE_TREASURY_ADDRESS ||
    '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51') as `0x${string}`,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
} as const;

export const PROTOCOL_FEE_BPS = 100; // 1.00%

export function feeAmount(amount: number): number {
  return (amount * PROTOCOL_FEE_BPS) / 10000;
}

export function netToSupplier(amount: number): number {
  return amount - feeAmount(amount);
}

export const netToSeller = netToSupplier;

export function explorerTxUrl(txHash: string): string {
  if (!txHash) return BOT_CHAIN.explorerUrl;
  return `${BOT_CHAIN.explorerUrl}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  if (!address) return BOT_CHAIN.explorerUrl;
  return `${BOT_CHAIN.explorerUrl}/address/${address}`;
}

export function shortAddress(addr: string, chars = 4): string {
  if (!addr) return '';
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function shortHash(hash: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

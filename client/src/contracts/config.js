import TradeLockEscrowABI from './TradeLockEscrowABI.json';

export const BOT_CHAIN_CONFIG = {
  chainId: 677,
  chainIdHex: '0x2a5',
  chainName: 'BOT Chain Mainnet',
  rpcUrl: 'https://rpc.botchain.ai',
  explorerUrl: 'https://scan.botchain.ai',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
};

export const BOT_CHAIN_TESTNET_CONFIG = {
  chainId: 968,
  chainIdHex: '0x3c8',
  chainName: 'BOT Chain Testnet',
  rpcUrl: 'https://rpc.bohr.life',
  explorerUrl: 'https://scan.bohr.life',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
};

// Exact Deployed Addresses on BOT Chain Mainnet (Chain ID 677)
export const CONTRACT_ADDRESSES = {
  TradeLockEscrow: import.meta.env.VITE_TRADELOCK_ESCROW_ADDRESS || '0xd77d14697bCC9D0a6DCA234b8612D3C0A5ae89eb',
  PaymentToken: import.meta.env.VITE_PAYMENT_TOKEN_ADDRESS || '0x0E965EAe12631A0826518e1811df9953355995fF',
  NativeBOT: '0x0000000000000000000000000000000000000000',
  USDt: '0x0E965EAe12631A0826518e1811df9953355995fF',
  AIOracle: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
  Treasury: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
};

// Exact Deployed Addresses on BOT Chain Testnet (Chain ID 968)
export const TESTNET_CONTRACT_ADDRESSES = {
  TradeLockEscrow: '0xaf3bE9a37Ee317A3a09Ef15981396fEc9d62eDC8',
  PaymentToken: '0xb9a148801fe8096B113e7f1F51aC46b829CA6cc0',
  NativeBOT: '0x0000000000000000000000000000000000000000',
  tUSD: '0xb9a148801fe8096B113e7f1F51aC46b829CA6cc0',
  AIOracle: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
  Treasury: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
};

export const ORDER_STATUS = {
  0: { label: 'NONE', color: 'slate', badgeClass: 'bg-slate-800 text-slate-400' },
  1: { label: 'CREATED', color: 'blue', badgeClass: 'bg-blue-950/70 text-blue-400 border border-blue-500/30' },
  2: { label: 'FUNDED', color: 'emerald', badgeClass: 'badge-emerald' },
  3: { label: 'EVIDENCE_SUBMITTED', color: 'amber', badgeClass: 'badge-amber' },
  4: { label: 'AI_VERIFIED', color: 'cyan', badgeClass: 'badge-cyan' },
  5: { label: 'RELEASED', color: 'emerald', badgeClass: 'bg-emerald-900/70 text-emerald-300 border border-emerald-400/50' },
  6: { label: 'REFUNDED', color: 'slate', badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600' },
  7: { label: 'DISPUTED', color: 'rose', badgeClass: 'badge-rose' },
};

export const AI_RECOMMENDATION = {
  0: { label: 'PENDING_ANALYSIS', color: 'slate', text: 'Analysis in progress' },
  1: { label: 'RELEASE_FUNDS', color: 'emerald', text: 'Release Escrow Funds', desc: '100% PO & shipping criteria met' },
  2: { label: 'REQUEST_REVIEW', color: 'amber', text: 'Request Buyer Review', desc: 'Minor variance detected in transit or specs' },
  3: { label: 'FLAG_DISPUTE', color: 'rose', text: 'Flag Critical Dispute', desc: 'Severe discrepancy or tampering detected' },
};

export function getExplorerTxUrl(txHash, isTestnet = false) {
  if (!txHash) return isTestnet ? BOT_CHAIN_TESTNET_CONFIG.explorerUrl : BOT_CHAIN_CONFIG.explorerUrl;
  return `${isTestnet ? BOT_CHAIN_TESTNET_CONFIG.explorerUrl : BOT_CHAIN_CONFIG.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address, isTestnet = false) {
  if (!address) return isTestnet ? BOT_CHAIN_TESTNET_CONFIG.explorerUrl : BOT_CHAIN_CONFIG.explorerUrl;
  return `${isTestnet ? BOT_CHAIN_TESTNET_CONFIG.explorerUrl : BOT_CHAIN_CONFIG.explorerUrl}/address/${address}`;
}

export { TradeLockEscrowABI };

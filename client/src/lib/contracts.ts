import TradeLockEscrowABI from '../contracts/TradeLockEscrowABI.json';

/**
 * BOT Chain Network Configurations (Mainnet 677 & Testnet 968)
 */
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
} as const;

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
} as const;

/**
 * Exact Deployed Contract Addresses on BOT Chain Mainnet (Chain ID 677)
 */
export const CONTRACT_ADDRESSES = {
  TradeLockEscrow: '0xd77d14697bCC9D0a6DCA234b8612D3C0A5ae89eb',
  PaymentToken: '0x0E965EAe12631A0826518e1811df9953355995fF',
  NativeBOT: '0x0000000000000000000000000000000000000000',
  USDt: '0x0E965EAe12631A0826518e1811df9953355995fF',
  AIOracle: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
  Treasury: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
} as const;

/**
 * Exact Deployed Contract Addresses on BOT Chain Testnet (Chain ID 968)
 */
export const TESTNET_CONTRACT_ADDRESSES = {
  TradeLockEscrow: '0xaf3bE9a37Ee317A3a09Ef15981396fEc9d62eDC8',
  PaymentToken: '0xb9a148801fe8096B113e7f1F51aC46b829CA6cc0',
  NativeBOT: '0x0000000000000000000000000000000000000000',
  tUSD: '0xb9a148801fe8096B113e7f1F51aC46b829CA6cc0',
  AIOracle: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
  Treasury: '0x34090545BD562b0bE1Cdc855F7cA9beE4566CE51',
} as const;

export const ORDER_STATUS_ENUM = {
  NONE: 0,
  CREATED: 1,
  FUNDED: 2,
  EVIDENCE_SUBMITTED: 3,
  AI_VERIFIED: 4,
  RELEASED: 5,
  REFUNDED: 6,
  DISPUTED: 7,
} as const;

export const AI_RECOMMENDATION_ENUM = {
  NONE: 0,
  RELEASE_FUNDS: 1,
  REQUEST_REVIEW: 2,
  FLAG_DISPUTE: 3,
} as const;

export interface PurchaseOrderParams {
  supplier: string;
  token: string;
  amount: bigint | string;
  deliveryDeadline: number;
  productCategory: number;
  expectedQuantity: bigint | number;
  quantityUnit: number;
  destination: string;
  orderRef: string;
  evidenceRequirementsHash: string;
}

export interface AIAttestationStruct {
  orderId: bigint | string;
  evidenceHash: string;
  reviewHash: string;
  score: number;
  recommendation: number;
  nonce: bigint | string;
  deadline: bigint | string;
}

export { TradeLockEscrowABI };

export const getExplorerTxUrl = (txHash: string, isTestnet = false): string =>
  `${isTestnet ? BOT_CHAIN_TESTNET_CONFIG.explorerUrl : BOT_CHAIN_CONFIG.explorerUrl}/tx/${txHash}`;

export const getExplorerAddressUrl = (address: string, isTestnet = false): string =>
  `${isTestnet ? BOT_CHAIN_TESTNET_CONFIG.explorerUrl : BOT_CHAIN_CONFIG.explorerUrl}/address/${address}`;

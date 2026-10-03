export type TradeStatus =
  | 'CREATED'
  | 'FUNDED'
  | 'EVIDENCE_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'RELEASE_PENDING'
  | 'DISPUTED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'CANCELLED';

export type AIRecommendation = 'RELEASE_FUNDS' | 'REQUEST_REVIEW' | 'FLAG_DISPUTE';

export type ProductCategory =
  | 'Agriculture'
  | 'Commodities'
  | 'Manufactured Goods'
  | 'Raw Materials'
  | 'Electronics'
  | 'Textiles'
  | 'Food & Beverage'
  | 'Energy'
  | 'Real Estate'
  | 'Other';

export type Unit = 'KG' | 'TONS' | 'LBS' | 'UNITS' | 'LITERS' | 'BARRELS' | 'BOXES' | 'PALLETS';

export interface Party {
  address: string;
  label?: string;
}

export interface Trade {
  id: string;
  reference: string;
  product: string;
  category: ProductCategory;
  quantity: number;
  unit: Unit;
  destination: string;
  deliveryDeadline: string; // ISO date
  buyer: Party;
  supplier: Party;
  amount: number;
  tokenSymbol: string;
  feeBps: number;
  status: TradeStatus;
  createdAt: string;
  fundedAt?: string;
  evidenceSubmittedAt?: string;
  reviewedAt?: string;
  releasedAt?: string;
  disputedAt?: string;
  fundTxHash?: string;
  releaseTxHash?: string;
  evidenceHash?: string;
  evidenceCount?: number;
  aiScore?: number;
  aiConfidence?: number;
  aiRecommendation?: AIRecommendation;
  description?: string;
}

export type EvidenceType =
  | 'BILL_OF_LADING'
  | 'PACKING_LIST'
  | 'DELIVERY_PHOTO'
  | 'TRACKING_REFERENCE'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'INSPECTION_REPORT'
  | 'INVOICE'
  | 'OTHER';

export interface EvidenceFile {
  id: string;
  type: EvidenceType;
  label: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface EvidencePackage {
  tradeId: string;
  files: EvidenceFile[];
  trackingReference?: string;
  notes?: string;
  hash: string;
  submittedAt: string;
}

export interface AICheck {
  id: string;
  label: string;
  expected?: string;
  detected?: string;
  result: 'MATCH' | 'MISMATCH' | 'PARTIAL' | 'NOT_VERIFIED';
  detail?: string;
  confidence: number;
}

export interface AIFinding {
  id: string;
  kind: 'POSITIVE' | 'WARNING' | 'ISSUE';
  text: string;
}

export interface AIReview {
  tradeId: string;
  score: number;
  confidence: number;
  recommendation: AIRecommendation;
  checks: AICheck[];
  findings: AIFinding[];
  summary: string;
  reviewedAt: string;
  modelVersion: string;
  signature?: string;
}

export type DisputeReason =
  | 'QUANTITY_MISMATCH'
  | 'DAMAGED_GOODS'
  | 'LATE_DELIVERY'
  | 'DOCUMENT_INCONSISTENCY'
  | 'OTHER';

export interface Dispute {
  id: string;
  tradeId: string;
  tradeReference: string;
  reason: DisputeReason;
  description: string;
  openedBy: string;
  openedAt: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_RELEASE' | 'RESOLVED_REFUND';
  evidenceCount: number;
}

export type TransactionState =
  | 'IDLE'
  | 'WALLET_CONFIRMATION'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILURE'
  | 'REJECTED';

export interface TransactionStatus {
  state: TransactionState;
  txHash?: string;
  message?: string;
  error?: string;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  botBalance: number | null;
  tokenBalance: number | null;
  tokenSymbol: string;
  isCorrectNetwork: boolean;
  connecting: boolean;
}

export interface CreateTradeInput {
  product: string;
  category: ProductCategory;
  quantity: number;
  unit: Unit;
  destination: string;
  deliveryDeadline: string;
  description?: string;
  supplierAddress: string;
  amount: number;
  tokenSymbol: string;
}

export const STATUS_ORDER: TradeStatus[] = [
  'CREATED',
  'FUNDED',
  'EVIDENCE_SUBMITTED',
  'UNDER_REVIEW',
  'RELEASE_PENDING',
  'RELEASED',
];

export const STATUS_LABELS: Record<TradeStatus, string> = {
  CREATED: 'Order Created',
  FUNDED: 'Escrow Funded',
  EVIDENCE_SUBMITTED: 'Evidence Submitted',
  UNDER_REVIEW: 'Under Review',
  RELEASE_PENDING: 'Release Pending',
  DISPUTED: 'Disputed',
  RELEASED: 'Funds Released',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
};

export const RECOMMENDATION_LABELS: Record<AIRecommendation, string> = {
  RELEASE_FUNDS: 'Release Funds',
  REQUEST_REVIEW: 'Request Review',
  FLAG_DISPUTE: 'Flag Dispute',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  BILL_OF_LADING: 'Bill of Lading',
  PACKING_LIST: 'Packing List',
  DELIVERY_PHOTO: 'Delivery Photo',
  TRACKING_REFERENCE: 'Tracking Reference',
  CERTIFICATE_OF_ORIGIN: 'Certificate of Origin',
  INSPECTION_REPORT: 'Inspection Report',
  INVOICE: 'Invoice',
  OTHER: 'Other Document',
};

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  QUANTITY_MISMATCH: 'Quantity mismatch',
  DAMAGED_GOODS: 'Damaged goods',
  LATE_DELIVERY: 'Late delivery',
  DOCUMENT_INCONSISTENCY: 'Document inconsistency',
  OTHER: 'Other',
};

export const UNIT_OPTIONS: Unit[] = ['KG', 'TONS', 'LBS', 'UNITS', 'LITERS', 'BARRELS', 'BOXES', 'PALLETS'];

export const CATEGORY_OPTIONS: ProductCategory[] = [
  'Real Estate',
  'Agriculture',
  'Commodities',
  'Manufactured Goods',
  'Raw Materials',
  'Electronics',
  'Textiles',
  'Food & Beverage',
  'Energy',
  'Other',
];

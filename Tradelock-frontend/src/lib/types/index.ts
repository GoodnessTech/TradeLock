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
  | 'Real Estate'
  | 'Residential'
  | 'Commercial'
  | 'Land'
  | 'Villa'
  | 'Penthouse'
  | 'Terrace'
  | 'Apartment'
  | 'Other';

export type Unit = 'UNITS' | 'SQM' | 'SQFT' | 'PLOTS' | 'ACRES' | 'HECTARES' | 'KG' | 'TONS';

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
  deliveryDeadline: string; // ISO date (Closing Deadline)
  buyer: Party;
  supplier: Party; // preserved for contract mapping (represents Seller)
  seller?: Party; // real-estate alias
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
  propertyType?: string;
  inspectionWindowDays?: number;
}

export type EvidenceType =
  | 'TITLE_DEED'
  | 'CADASTRAL_SURVEY'
  | 'INSPECTION_REPORT'
  | 'BUILDING_PERMIT'
  | 'PROPERTY_PHOTO'
  | 'CLOSING_STATEMENT'
  | 'TAX_CLEARANCE'
  | 'BILL_OF_LADING'
  | 'PACKING_LIST'
  | 'DELIVERY_PHOTO'
  | 'TRACKING_REFERENCE'
  | 'CERTIFICATE_OF_ORIGIN'
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
  | 'TITLE_INCONSISTENCY'
  | 'INSPECTION_DEFECT'
  | 'CLOSING_DELAY'
  | 'DOCUMENT_DEFECT'
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
  product: string; // Property title
  category: ProductCategory;
  quantity: number;
  unit: Unit;
  destination: string; // Location
  deliveryDeadline: string; // Closing date
  description?: string;
  supplierAddress: string; // Seller EVM address
  sellerAddress?: string;
  amount: number; // Purchase / Escrow price
  tokenSymbol: string;
  propertyType?: string;
  inspectionWindow?: number;
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
  CREATED: 'Agreement Created',
  FUNDED: 'Escrow Secured',
  EVIDENCE_SUBMITTED: 'Documents & Inspection Submitted',
  UNDER_REVIEW: 'Under Review',
  RELEASE_PENDING: 'Buyer Approval Pending',
  DISPUTED: 'Disputed',
  RELEASED: 'Funds Settled to Seller',
  REFUNDED: 'Refunded to Buyer',
  CANCELLED: 'Cancelled',
};

export const RECOMMENDATION_LABELS: Record<AIRecommendation, string> = {
  RELEASE_FUNDS: 'Approve Settlement',
  REQUEST_REVIEW: 'Request Human Review',
  FLAG_DISPUTE: 'Flag Title / Defect Issue',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  TITLE_DEED: 'Deed of Assignment / Title Deed',
  CADASTRAL_SURVEY: 'Cadastral Survey Plan & Coordinates',
  INSPECTION_REPORT: 'Certified Property Inspection Report',
  BUILDING_PERMIT: 'Building Approval / Certificate of Occupancy',
  PROPERTY_PHOTO: 'Property Condition & Handover Photos',
  CLOSING_STATEMENT: 'Closing Settlement Statement',
  TAX_CLEARANCE: 'Tax Clearance & Ground Rent Receipts',
  BILL_OF_LADING: 'Deed of Assignment / Title Conveyance',
  PACKING_LIST: 'Property Specification & Inventory Pack',
  DELIVERY_PHOTO: 'On-site Inspection & As-built Photos',
  TRACKING_REFERENCE: 'Registry / Cadastral Beacon Reference',
  CERTIFICATE_OF_ORIGIN: 'Survey & Zoning Certificate',
  INVOICE: 'Purchase Agreement & Valuation Invoice',
  OTHER: 'Other Property Document',
};

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  TITLE_INCONSISTENCY: 'Title deed or boundary inconsistency',
  INSPECTION_DEFECT: 'Unresolved structural / MEP defect',
  CLOSING_DELAY: 'Closing deadline exceeded',
  DOCUMENT_DEFECT: 'Missing legal or cadastral documentation',
  QUANTITY_MISMATCH: 'Boundary or area mismatch',
  DAMAGED_GOODS: 'Inspection condition failure',
  LATE_DELIVERY: 'Delayed closing / handover',
  DOCUMENT_INCONSISTENCY: 'Document or deed inconsistency',
  OTHER: 'Other property dispute',
};

export const UNIT_OPTIONS: Unit[] = ['UNITS', 'SQM', 'SQFT', 'PLOTS', 'ACRES', 'HECTARES'];

export const CATEGORY_OPTIONS: ProductCategory[] = [
  'Real Estate',
  'Residential',
  'Villa',
  'Penthouse',
  'Terrace',
  'Commercial',
  'Land',
  'Apartment',
  'Other',
];

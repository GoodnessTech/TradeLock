import { PROTOCOL_CONFIG } from './botchain';

const API_BASE = PROTOCOL_CONFIG.apiBaseUrl;

export interface BackendOrder {
  id: string;
  rawId?: string;
  title: string;
  commodity: string;
  category: string;
  amount: string | number;
  currency: string;
  tokenAddress: string;
  expectedQuantity: number;
  quantityUnit: string;
  buyerAddress: string;
  buyerName: string;
  supplierAddress: string;
  supplierName: string;
  originPort: string;
  destinationPort: string;
  incoterm: string;
  deliveryDeadline: string;
  qualityParameters?: Record<string, unknown>;
  status: string;
  feeBps: number;
  isDemo?: boolean;
  contractAddress?: string;
  chainId?: number;
  creationTxHash?: string | null;
  fundingTxHash?: string | null;
  releaseTxHash?: string | null;
  evidenceHash?: string | null;
  evidence?: Record<string, unknown>;
  aiScore?: number;
  aiRecommendation?: string;
  aiReviewHash?: string | null;
  createdAt: string;
  updatedAt?: string;
  fundedAt?: string;
  evidenceSubmittedAt?: string;
  reviewedAt?: string;
  releasedAt?: string;
  disputedAt?: string;
}

export interface BackendEvidence {
  id: string;
  orderId: string;
  evidenceHash: string;
  submittedBy: string;
  submittedAt: string;
  payload: Record<string, unknown>;
  ipfsUri?: string;
  submissionTxHash?: string;
  tamperDetected?: boolean;
}

export interface BackendAIReview {
  id: string;
  orderId: string;
  evidenceHash: string;
  reviewHash: string;
  overallScore: number;
  recommendation: string;
  recommendationCode: number;
  confidence: number;
  quantityMatch: string;
  dateMatch: string;
  documentConsistency: string;
  conditionAssessment: string;
  anomalies: Array<{ type: string; severity: string; description: string }>;
  summary: string;
  epistemicBreakdown?: Record<string, unknown>;
  vectors?: Record<string, unknown>;
  fullReport?: Record<string, unknown>;
  aiProvider: string;
  reviewedAt: string;
  validationStatus?: string;
}

export interface BackendAttestation {
  signer: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  attestation: {
    orderId: string;
    evidenceHash: string;
    reviewHash: string;
    score: number;
    recommendation: number;
    nonce: string;
    deadline: string;
  };
  signature: string;
  messageHash?: string;
  legacyMessageHash?: string;
  legacySignature?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalVolume: number;
  totalFunded: number;
  totalReleased: number;
  totalDisputed: number;
  activeOrders: number;
  aiVerifiedOrders: number;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchOrders(filters: {
  status?: string;
  buyer?: string;
  supplier?: string;
  search?: string;
} = {}): Promise<{ success: boolean; count: number; orders: BackendOrder[]; trades: BackendOrder[] }> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.buyer) params.set('buyer', filters.buyer);
  if (filters.supplier) params.set('supplier', filters.supplier);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/orders${query}`);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
  return res.json();
}

export async function fetchOrder(id: string): Promise<{ success: boolean; order: BackendOrder; trade: BackendOrder }> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch order ${id}: ${res.statusText}`);
  return res.json();
}

export async function createOrder(payload: Partial<BackendOrder>): Promise<{
  success: boolean;
  order: BackendOrder;
  trade: BackendOrder;
}> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create order: ${res.statusText}`);
  }
  return res.json();
}

export async function submitEvidenceApi(
  orderId: string,
  evidencePayload: {
    evidence?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    ipfsUri?: string;
    submissionTxHash?: string;
    submittedBy?: string;
  },
): Promise<{
  success: boolean;
  evidence: BackendEvidence;
  order: BackendOrder;
  trade: BackendOrder;
}> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evidencePayload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to submit evidence: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeOrder(
  orderId: string,
  payload: { evidence?: Record<string, unknown> } = {},
): Promise<{
  success: boolean;
  review: BackendAIReview;
  order: BackendOrder;
}> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze order: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchOrderReview(orderId: string): Promise<{
  success: boolean;
  review: BackendAIReview;
}> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/review`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch review: ${res.statusText}`);
  }
  return res.json();
}

export async function requestAttestation(
  orderId: string,
  payload: {
    contractAddress?: string;
    chainId?: number;
    evidence?: Record<string, unknown>;
  } = {},
): Promise<{
  success: boolean;
  attestation: BackendAttestation;
  attestationRecord: Record<string, unknown>;
  order: BackendOrder;
}> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/attestation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to request attestation: ${res.statusText}`);
  }
  return res.json();
}

export async function verifyOrder(
  orderId: string,
  payload: {
    evidence?: Record<string, unknown>;
    contractAddress?: string;
    chainId?: number;
  } = {},
): Promise<{
  success: boolean;
  review: Record<string, unknown>;
  report: Record<string, unknown>;
  attestation: BackendAttestation;
  order: BackendOrder;
  trade: BackendOrder;
}> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to verify order: ${res.statusText}`);
  }
  return res.json();
}

export async function recordTransaction(
  orderId: string,
  txPayload: {
    txHash: string;
    txType: string;
    fromAddress?: string;
    toAddress?: string;
    amount?: string | number;
    currency?: string;
    blockNumber?: number;
    gasUsed?: string | number;
    status?: string;
  },
) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txPayload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to record transaction: ${res.statusText}`);
  }
  return res.json();
}

export async function disputeOrder(
  orderId: string,
  disputePayload: {
    initiatorAddress?: string;
    reasonDescription?: string;
    disputeTxHash?: string;
  },
) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/dispute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disputePayload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to submit dispute: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDashboardStats(): Promise<{
  success: boolean;
  stats: DashboardStats;
}> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error(`Failed to fetch dashboard stats: ${res.statusText}`);
  return res.json();
}

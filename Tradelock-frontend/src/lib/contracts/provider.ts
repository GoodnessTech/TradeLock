import type { Trade, AIReview, EvidencePackage, Dispute } from '@/lib/types';

export interface TradeDataProvider {
  listTrades(): Promise<Trade[]>;
  getTrade(id: string): Promise<Trade | null>;
  createTrade(input: Omit<Trade, 'id' | 'reference' | 'status' | 'createdAt' | 'buyer' | 'feeBps'>): Promise<Trade>;
  fundEscrow(tradeId: string): Promise<{ txHash: string }>;
  submitEvidence(tradeId: string, pkg: Omit<EvidencePackage, 'hash' | 'submittedAt'>): Promise<{ hash: string }>;
  getEvidence(tradeId: string): Promise<EvidencePackage | null>;
  getAIReview(tradeId: string): Promise<AIReview | null>;
  releaseFunds(tradeId: string): Promise<{ txHash: string }>;
  raiseDispute(tradeId: string, reason: string, description: string): Promise<{ disputeId: string }>;
  listDisputes(): Promise<Dispute[]>;
}

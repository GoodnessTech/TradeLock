import type { TradeDataProvider } from './provider';
import type { Trade, AIReview, EvidencePackage, Dispute } from '@/lib/types';
import { MOCK_TRADES, MOCK_AI_REVIEW, MOCK_EVIDENCE, MOCK_DISPUTES } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const randomHash = () =>
  '0x' +
  Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

export const MockTradeDataProvider: TradeDataProvider = {
  async listTrades() {
    await delay(300);
    return [...MOCK_TRADES];
  },
  async getTrade(id) {
    await delay(250);
    return MOCK_TRADES.find((t) => t.id === id || t.reference === id) ?? null;
  },
  async createTrade(input) {
    await delay(400);
    const ref = input.product.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) + '-' + String(Math.floor(1000 + Math.random() * 9000));
    const trade: Trade = {
      ...input,
      id: 't-' + Math.random().toString(36).slice(2, 9),
      reference: ref,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      buyer: { address: '0x72F4C1aB29dE8A5E3f0c2D1b9a4F6e0C7b3A91d2' },
      feeBps: 100,
    };
    MOCK_TRADES.unshift(trade);
    return trade;
  },
  async fundEscrow(tradeId) {
    await delay(600);
    const t = MOCK_TRADES.find((x) => x.id === tradeId);
    if (t) {
      t.status = 'FUNDED';
      t.fundedAt = new Date().toISOString();
      t.fundTxHash = randomHash();
    }
    return { txHash: randomHash() };
  },
  async submitEvidence(tradeId, pkg) {
    await delay(500);
    const hash = randomHash();
    const full: EvidencePackage = {
      ...pkg,
      tradeId,
      hash,
      submittedAt: new Date().toISOString(),
    };
    const t = MOCK_TRADES.find((x) => x.id === tradeId);
    if (t) {
      t.status = 'EVIDENCE_SUBMITTED';
      t.evidenceSubmittedAt = new Date().toISOString();
      t.evidenceHash = hash;
      t.evidenceCount = pkg.files.length;
    }
    return { hash };
  },
  async getEvidence(tradeId) {
    await delay(200);
    if (tradeId === 't-2408' || tradeId === 'COCOA-2408') return MOCK_EVIDENCE;
    return null;
  },
  async getAIReview(tradeId) {
    await delay(300);
    if (tradeId === 't-2408' || tradeId === 'COCOA-2408') return MOCK_AI_REVIEW;
    const t = MOCK_TRADES.find((x) => x.id === tradeId);
    if (t && t.aiScore) {
      return {
        ...MOCK_AI_REVIEW,
        tradeId,
        score: t.aiScore,
        confidence: t.aiConfidence ?? 90,
        recommendation: t.aiRecommendation ?? 'REQUEST_REVIEW',
      } as AIReview;
    }
    return null;
  },
  async releaseFunds(tradeId) {
    await delay(700);
    const t = MOCK_TRADES.find((x) => x.id === tradeId);
    if (t) {
      t.status = 'RELEASED';
      t.releasedAt = new Date().toISOString();
      t.releaseTxHash = randomHash();
    }
    return { txHash: randomHash() };
  },
  async raiseDispute(tradeId, reason, description) {
    await delay(400);
    const t = MOCK_TRADES.find((x) => x.id === tradeId);
    if (t) {
      t.status = 'DISPUTED';
      t.disputedAt = new Date().toISOString();
    }
    const d: Dispute = {
      id: 'd-' + Math.random().toString(36).slice(2, 6),
      tradeId,
      tradeReference: t?.reference ?? '',
      reason: reason as Dispute['reason'],
      description,
      openedBy: '0x72F4C1aB29dE8A5E3f0c2D1b9a4F6e0C7b3A91d2',
      openedAt: new Date().toISOString(),
      status: 'OPEN',
      evidenceCount: 0,
    };
    MOCK_DISPUTES.unshift(d);
    return { disputeId: d.id };
  },
  async listDisputes() {
    await delay(250);
    return [...MOCK_DISPUTES];
  },
};

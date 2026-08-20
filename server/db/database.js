const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

/**
 * TradeLock Relational Database Engine
 * Implements Section 18: Database Relational Schema
 * Supporting tables: users, orders, evidence, ai_reviews, ai_attestations, transactions, disputes
 * With file persistence, relational indexing, and querying.
 */
class TradeLockDatabase {
  constructor(dbFilePath = null) {
    this.dbFilePath = dbFilePath || path.join(__dirname, "tradelock_data.json");
    this.tables = {
      users: new Map(),
      orders: new Map(),
      evidence: new Map(),
      ai_reviews: new Map(),
      ai_attestations: new Map(),
      transactions: new Map(),
      disputes: new Map(),
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, "utf8");
        const data = JSON.parse(raw);
        for (const [tableName, records] of Object.entries(data)) {
          if (this.tables[tableName]) {
            this.tables[tableName] = new Map(records);
          }
        }
      }
    } catch (e) {
      console.warn("[TradeLock DB] Initialization from disk warning:", e.message);
    }
  }

  saveToDisk() {
    try {
      const serializable = {};
      for (const [tableName, map] of Object.entries(this.tables)) {
        serializable[tableName] = Array.from(map.entries());
      }
      fs.writeFileSync(this.dbFilePath, JSON.stringify(serializable, null, 2), "utf8");
    } catch (e) {
      console.error("[TradeLock DB] Save to disk error:", e);
    }
  }

  // --- 1. USERS ---
  createUser(user) {
    const id = user.id || `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record = {
      id,
      address: user.address.toLowerCase(),
      name: user.name || "Anonymous Trader",
      role: user.role || "USER",
      organization: user.organization || "",
      country: user.country || "",
      reputationScore: user.reputationScore || 100,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tables.users.set(record.address, record);
    this.saveToDisk();
    return record;
  }

  getUserByAddress(address) {
    if (!address) return null;
    return this.tables.users.get(address.toLowerCase()) || null;
  }

  // --- 2. ORDERS ---
  createOrder(order) {
    const rawId = order.rawId || `PO-${Date.now()}`;
    const id = order.id
      ? order.id.toLowerCase()
      : ("0x" + Buffer.from(rawId).toString("hex").padEnd(64, "0")).toLowerCase();

    const record = {
      id,
      rawId,
      title: order.title || `${order.expectedQuantity || 10} MT ${order.commodity || "Commodity"}`,
      commodity: order.commodity || "General Commodity",
      category: order.category || "Agricultural Commodities",
      amount: order.amount.toString(),
      currency: order.currency || "BOT",
      tokenAddress: (order.tokenAddress || "0x0000000000000000000000000000000000000000").toLowerCase(),
      expectedQuantity: parseFloat(order.expectedQuantity || 10),
      quantityUnit: order.quantityUnit || "Metric Tons",
      buyerAddress: (order.buyerAddress || "0x0000000000000000000000000000000000000000").toLowerCase(),
      buyerName: order.buyerName || "Buyer Corporation",
      supplierAddress: (order.supplierAddress || "0x0000000000000000000000000000000000000000").toLowerCase(),
      supplierName: order.supplierName || "Supplier Exporter",
      originPort: order.originPort || "Origin Port",
      destinationPort: order.destinationPort || "Destination Port",
      incoterm: order.incoterm || "CIF",
      deliveryDeadline: order.deliveryDeadline || new Date(Date.now() + 86400000 * 14).toISOString(),
      qualityParameters: order.qualityParameters || {},
      status: order.status || "CREATED",
      feeBps: order.feeBps !== undefined ? Number(order.feeBps) : 100,
      isDemo: Boolean(order.isDemo),
      contractAddress: order.contractAddress || process.env.CONTRACT_ADDRESS || "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88",
      chainId: Number(order.chainId || 677),
      creationTxHash: order.creationTxHash || null,
      fundingTxHash: order.fundingTxHash || null,
      releaseTxHash: order.releaseTxHash || null,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tables.orders.set(id, record);
    this.saveToDisk();
    return record;
  }

  getOrderById(id) {
    if (!id) return null;
    const normalized = id.toLowerCase();
    const order = this.tables.orders.get(normalized);
    if (!order) return null;

    // Attach relational children
    const evidenceRecord = this.getEvidenceByOrderId(normalized);
    const evidencePayload = evidenceRecord ? (evidenceRecord.payload || evidenceRecord) : null;
    const aiReview = this.getLatestAIReview(normalized);
    const aiAttestation = this.getAIAttestationByOrderId(normalized);
    const transactions = this.getTransactionsByOrderId(normalized);
    const dispute = this.getDisputeByOrderId(normalized);

    return {
      ...order,
      evidence: evidencePayload,
      evidenceRecord,
      evidenceDetails: evidenceRecord,
      aiReview,
      aiReport: aiReview, // Compatibility alias
      aiAttestation,
      attestation: aiAttestation, // Compatibility alias
      transactions,
      dispute,
    };
  }

  getAllOrders(filters = {}) {
    let orders = Array.from(this.tables.orders.values());

    if (filters.status) {
      orders = orders.filter((o) => o.status.toUpperCase() === filters.status.toUpperCase());
    }
    if (filters.buyerAddress) {
      orders = orders.filter((o) => o.buyerAddress.toLowerCase() === filters.buyerAddress.toLowerCase());
    }
    if (filters.supplierAddress) {
      orders = orders.filter((o) => o.supplierAddress.toLowerCase() === filters.supplierAddress.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.rawId.toLowerCase().includes(q) ||
          o.commodity.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.supplierName.toLowerCase().includes(q)
      );
    }

    // Return rich object with evidence and aiReview summary
    return orders.map((o) => {
      const evidence = this.getEvidenceByOrderId(o.id);
      const aiReview = this.getLatestAIReview(o.id);
      const aiAttestation = this.getAIAttestationByOrderId(o.id);
      return {
        ...o,
        evidence: evidence ? evidence.payload : null,
        evidenceDetails: evidence,
        aiReport: aiReview,
        attestation: aiAttestation,
      };
    });
  }

  updateOrderStatus(id, status, extraData = {}) {
    const normalized = id.toLowerCase();
    const order = this.tables.orders.get(normalized);
    if (!order) return null;

    const updated = {
      ...order,
      ...extraData,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.tables.orders.set(normalized, updated);
    this.saveToDisk();
    return this.getOrderById(normalized);
  }

  // --- 3. EVIDENCE ---
  createEvidence(evidenceData) {
    const id = evidenceData.id || `EVD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = evidenceData.orderId.toLowerCase();

    // Compute evidenceHash if not provided
    let evidenceHash = evidenceData.evidenceHash;
    if (!evidenceHash) {
      const payloadString = JSON.stringify(evidenceData.payload || evidenceData);
      evidenceHash = ethers.keccak256(ethers.toUtf8Bytes(payloadString));
    }

    const record = {
      id,
      orderId,
      evidenceHash,
      ipfsUri: evidenceData.ipfsUri || `ipfs://QmTradeLockEvidence${Date.now()}`,
      payload: evidenceData.payload || evidenceData,
      tamperDetected: Boolean(evidenceData.tamperDetected),
      isDemoEvidence: Boolean(evidenceData.isDemoEvidence),
      submittedBy: (evidenceData.submittedBy || "0x0000000000000000000000000000000000000000").toLowerCase(),
      submissionTxHash: evidenceData.submissionTxHash || null,
      createdAt: evidenceData.createdAt || new Date().toISOString(),
    };

    this.tables.evidence.set(orderId, record);
    this.updateOrderStatus(orderId, "EVIDENCE_SUBMITTED");
    this.saveToDisk();
    return record;
  }

  getEvidenceByOrderId(orderId) {
    if (!orderId) return null;
    return this.tables.evidence.get(orderId.toLowerCase()) || null;
  }

  // --- 4. AI REVIEWS ---
  createAIReview(reviewData) {
    const id = reviewData.id || `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = reviewData.orderId.toLowerCase();

    const record = {
      id,
      orderId,
      evidenceHash: reviewData.evidenceHash,
      reviewHash: reviewData.reviewHash,
      overallScore: reviewData.overallScore,
      recommendation: reviewData.recommendation,
      recommendationCode: reviewData.recommendationCode,
      confidence: reviewData.confidence,
      quantityMatch: reviewData.quantityMatch,
      dateMatch: reviewData.dateMatch,
      documentConsistency: reviewData.documentConsistency,
      conditionAssessment: reviewData.conditionAssessment,
      anomalies: reviewData.anomalies || [],
      summary: reviewData.summary || "",
      epistemicBreakdown: reviewData.epistemicBreakdown || {},
      vectors: reviewData.vectors || {},
      fullReport: reviewData.fullReport || reviewData,
      aiProvider: reviewData.aiProvider || "DeterministicRuleAIProvider",
      validationStatus: reviewData.validationStatus || "VALID",
      reviewedAt: reviewData.reviewedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Store by review ID and index for order
    this.tables.ai_reviews.set(id, record);
    this.tables.ai_reviews.set(`order_${orderId}`, record);

    this.updateOrderStatus(orderId, "AI_VERIFIED");
    this.saveToDisk();
    return record;
  }

  getLatestAIReview(orderId) {
    if (!orderId) return null;
    return this.tables.ai_reviews.get(`order_${orderId.toLowerCase()}`) || null;
  }

  // --- 5. AI ATTESTATIONS ---
  createAIAttestation(attestationData) {
    const id = attestationData.id || `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = attestationData.orderId.toLowerCase();

    const record = {
      id,
      orderId,
      reviewId: attestationData.reviewId || null,
      evidenceHash: attestationData.evidenceHash,
      reviewHash: attestationData.reviewHash,
      score: attestationData.score,
      recommendationCode: attestationData.recommendationCode,
      nonce: attestationData.nonce.toString(),
      deadline: attestationData.deadline.toString(),
      signature: attestationData.signature,
      signerAddress: (attestationData.signerAddress || attestationData.signer).toLowerCase(),
      chainId: Number(attestationData.chainId || 677),
      verifyingContract: attestationData.contractAddress || attestationData.verifyingContract,
      attestation: attestationData.attestation || {
        orderId: attestationData.orderId,
        evidenceHash: attestationData.evidenceHash,
        reviewHash: attestationData.reviewHash,
        score: attestationData.score,
        recommendation: attestationData.recommendationCode,
        nonce: attestationData.nonce.toString(),
        deadline: attestationData.deadline.toString(),
      },
      legacyMessageHash: attestationData.legacyMessageHash || null,
      legacySignature: attestationData.legacySignature || null,
      createdAt: new Date().toISOString(),
    };

    this.tables.ai_attestations.set(`order_${orderId}`, record);
    this.saveToDisk();
    return record;
  }

  getAIAttestationByOrderId(orderId) {
    if (!orderId) return null;
    return this.tables.ai_attestations.get(`order_${orderId.toLowerCase()}`) || null;
  }

  // --- 6. TRANSACTIONS ---
  createTransaction(txData) {
    const id = txData.id || `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = txData.orderId ? txData.orderId.toLowerCase() : null;

    const record = {
      id,
      orderId,
      txHash: txData.txHash,
      txType: txData.txType || "UNKNOWN",
      fromAddress: (txData.fromAddress || "").toLowerCase(),
      toAddress: (txData.toAddress || "").toLowerCase(),
      amount: txData.amount || "0",
      currency: txData.currency || "BOT",
      chainId: Number(txData.chainId || 677),
      blockNumber: txData.blockNumber || null,
      gasUsed: txData.gasUsed || null,
      status: txData.status || "CONFIRMED",
      createdAt: txData.createdAt || new Date().toISOString(),
    };

    this.tables.transactions.set(record.txHash, record);
    this.saveToDisk();
    return record;
  }

  getTransactionsByOrderId(orderId) {
    if (!orderId) return [];
    const normalized = orderId.toLowerCase();
    return Array.from(this.tables.transactions.values()).filter((t) => t.orderId === normalized);
  }

  getAllTransactions(limit = 50) {
    return Array.from(this.tables.transactions.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // --- 7. DISPUTES ---
  createDispute(disputeData) {
    const id = disputeData.id || `DSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = disputeData.orderId.toLowerCase();

    const record = {
      id,
      orderId,
      initiatorAddress: disputeData.initiatorAddress.toLowerCase(),
      reasonHash: disputeData.reasonHash,
      reasonDescription: disputeData.reasonDescription || "Trade Terms Breach",
      status: disputeData.status || "OPEN",
      buyerShareBps: disputeData.buyerShareBps || null,
      supplierShareBps: disputeData.supplierShareBps || null,
      disputeAdmin: disputeData.disputeAdmin ? disputeData.disputeAdmin.toLowerCase() : null,
      resolutionTxHash: disputeData.resolutionTxHash || null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    this.tables.disputes.set(orderId, record);
    this.updateOrderStatus(orderId, "DISPUTED");
    this.saveToDisk();
    return record;
  }

  getDisputeByOrderId(orderId) {
    if (!orderId) return null;
    return this.tables.disputes.get(orderId.toLowerCase()) || null;
  }

  resolveDispute(orderId, resolutionData) {
    const normalized = orderId.toLowerCase();
    const dispute = this.tables.disputes.get(normalized);
    if (!dispute) return null;

    const updated = {
      ...dispute,
      status: "RESOLVED",
      buyerShareBps: Number(resolutionData.buyerShareBps),
      supplierShareBps: 10000 - Number(resolutionData.buyerShareBps),
      disputeAdmin: resolutionData.disputeAdmin ? resolutionData.disputeAdmin.toLowerCase() : dispute.disputeAdmin,
      resolutionTxHash: resolutionData.resolutionTxHash || dispute.resolutionTxHash,
      resolvedAt: new Date().toISOString(),
    };

    this.tables.disputes.set(normalized, updated);
    this.updateOrderStatus(normalized, "RELEASED");
    this.saveToDisk();
    return updated;
  }

  // --- 8. DASHBOARD STATS ---
  getDashboardStats() {
    const orders = Array.from(this.tables.orders.values());
    const aiReviews = Array.from(this.tables.ai_reviews.values()).filter((r) => r.overallScore !== undefined);

    let totalVolumeUSD = 0;
    let activeEscrows = 0;
    let releasedEscrows = 0;
    let disputedEscrows = 0;

    orders.forEach((o) => {
      const amt = parseFloat(o.amount || 0);
      totalVolumeUSD += amt;
      if (["CREATED", "FUNDED", "EVIDENCE_SUBMITTED", "AI_VERIFIED"].includes(o.status)) {
        activeEscrows++;
      } else if (o.status === "RELEASED") {
        releasedEscrows++;
      } else if (o.status === "DISPUTED") {
        disputedEscrows++;
      }
    });

    const averageConfidence =
      aiReviews.length > 0
        ? Math.round(aiReviews.reduce((sum, r) => sum + Number(r.overallScore), 0) / aiReviews.length)
        : 92;

    return {
      totalTradesCount: orders.length,
      totalVolumeUSD,
      activeEscrows,
      releasedEscrows,
      disputedEscrows,
      disputeRate: orders.length > 0 ? ((disputedEscrows / orders.length) * 100).toFixed(1) + "%" : "0.0%",
      releaseRate: orders.length > 0 ? ((releasedEscrows / orders.length) * 100).toFixed(1) + "%" : "100.0%",
      averageConfidenceScore: averageConfidence,
      network: {
        name: "BOT Chain Mainnet",
        chainId: 677,
        rpc: "https://rpc.botchain.ai",
        explorer: "https://scan.botchain.ai",
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  // --- 9. SEED DEMO DATA ---
  seedDemoData(sampleTrades) {
    if (!sampleTrades || !Array.isArray(sampleTrades)) return;

    sampleTrades.forEach((sample) => {
      const orderId = sample.id.toLowerCase();
      // Only seed if not already present or refresh demo record
      const order = this.createOrder({
        ...sample,
        id: orderId,
        isDemo: true,
      });

      if (sample.evidence) {
        this.createEvidence({
          orderId,
          payload: sample.evidence,
          isDemoEvidence: true,
          tamperDetected: Boolean(sample.evidence.tamperDetected),
          submittedBy: sample.supplierAddress,
        });
      }
    });

    console.log(`[TradeLock DB] Seeded ${sampleTrades.length} Demo RWA Trade Packages into Relational DB.`);
  }
}

module.exports = TradeLockDatabase;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const TradeLockDatabase = require("./db/database");
const AIProviderFactory = require("./services/aiProviderFactory");
const OracleSigner = require("./services/oracleSigner");
const DEMO_TRADES = require("./data/demoTrades");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 1. Initialize Relational Database Engine (Section 18)
const db = new TradeLockDatabase();
db.seedDemoData(DEMO_TRADES);

// 2. Initialize AI Oracle Cryptographic Signer (Private key strictly server-side)
const oracleSigner = new OracleSigner(process.env.ORACLE_PRIVATE_KEY);
const oracleAddress = oracleSigner.getOracleAddress();

// 3. AI Provider Abstraction (Section 19)
const aiProvider = AIProviderFactory.getProvider();

console.log(`[TradeLock Protocol] Initialized on BOT Chain Mainnet 677`);
console.log(`[TradeLock Protocol] AI Oracle Signer Address: ${oracleAddress}`);
console.log(`[TradeLock Protocol] Active AI Provider: ${aiProvider.name}`);

// ====================================================================
// SECTION 17: BACKEND API ENDPOINTS
// ====================================================================

// 1. Health & Protocol Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ONLINE",
    protocol: "TradeLock",
    tagline: "Trade without blind trust",
    network: {
      name: "BOT Chain Mainnet",
      chainId: 677,
      rpc: "https://rpc.botchain.ai",
      explorer: "https://scan.botchain.ai",
      nativeCurrency: "BOT",
    },
    oracle: {
      address: oracleAddress,
      algorithm: "ECDSA_EIP712_SECP256K1",
    },
    aiProvider: aiProvider.getProviderInfo(),
    database: {
      type: "Relational",
      tables: ["users", "orders", "evidence", "ai_reviews", "ai_attestations", "transactions", "disputes"],
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. GET /api/orders — List all orders with optional search and filters
app.get(["/api/orders", "/api/trades"], (req, res) => {
  try {
    const { status, buyer, supplier, search } = req.query;
    const orders = db.getAllOrders({
      status,
      buyerAddress: buyer,
      supplierAddress: supplier,
      search,
    });
    res.json({ success: true, count: orders.length, orders, trades: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/orders/:id — Retrieve full order detail
app.get(["/api/orders/:id", "/api/trades/:id"], (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, order, trade: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST /api/orders — Create a new Purchase Order / Escrow record
app.post(["/api/orders", "/api/trades"], (req, res) => {
  try {
    const {
      title,
      commodity,
      category,
      amount,
      currency,
      expectedQuantity,
      unit,
      quantityUnit,
      buyerName,
      buyerAddress,
      supplierName,
      supplierAddress,
      originPort,
      destinationPort,
      incoterm,
      deliveryDeadline,
      qualityParameters,
      tokenAddress,
      feeBps,
      creationTxHash,
      contractAddress,
      chainId,
      isDemo,
    } = req.body;

    if (!amount || (!buyerAddress && !buyerName)) {
      return res.status(400).json({
        success: false,
        error: "Missing required order parameters (amount, buyer details)",
      });
    }

    const newOrder = db.createOrder({
      title,
      commodity,
      category,
      amount: amount || "10000",
      currency: currency || "BOT",
      tokenAddress: tokenAddress || "0x0000000000000000000000000000000000000000",
      expectedQuantity: parseFloat(expectedQuantity || 10),
      quantityUnit: quantityUnit || unit || "Metric Tons",
      buyerName: buyerName || "Buyer Corporation",
      buyerAddress: buyerAddress || "0x0000000000000000000000000000000000000000",
      supplierName: supplierName || "Supplier Exporter",
      supplierAddress: supplierAddress || "0x0000000000000000000000000000000000000000",
      originPort: originPort || "Origin Port",
      destinationPort: destinationPort || "Destination Port",
      incoterm: incoterm || "CIF",
      deliveryDeadline: deliveryDeadline || new Date(Date.now() + 86400000 * 14).toISOString(),
      qualityParameters: qualityParameters || { moistureMax: 7.5, expectedGrade: "Grade 1" },
      feeBps: feeBps || 100,
      isDemo: Boolean(isDemo),
      contractAddress: contractAddress || process.env.CONTRACT_ADDRESS || "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88",
      chainId: chainId || 677,
      creationTxHash,
    });

    if (creationTxHash) {
      db.createTransaction({
        orderId: newOrder.id,
        txHash: creationTxHash,
        txType: "CREATE_ORDER",
        fromAddress: newOrder.buyerAddress,
        toAddress: newOrder.contractAddress,
        amount: newOrder.amount,
        currency: newOrder.currency,
      });
    }

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully in relational database",
      order: newOrder,
      trade: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST /api/orders/:id/evidence — Submit shipping & inspection manifests
app.post(["/api/orders/:id/evidence", "/api/trades/:id/evidence"], (req, res) => {
  try {
    const orderId = req.params.id;
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const { evidence, payload, ipfsUri, submissionTxHash, submittedBy } = req.body;
    const evidencePayload = evidence || payload || req.body;

    const evidenceRecord = db.createEvidence({
      orderId: order.id,
      payload: evidencePayload,
      ipfsUri,
      submittedBy: submittedBy || order.supplierAddress,
      submissionTxHash,
      tamperDetected: Boolean(evidencePayload?.tamperDetected || evidencePayload?.isForged),
      isDemoEvidence: Boolean(order.isDemo),
    });

    if (submissionTxHash) {
      db.createTransaction({
        orderId: order.id,
        txHash: submissionTxHash,
        txType: "SUBMIT_EVIDENCE",
        fromAddress: submittedBy || order.supplierAddress,
        toAddress: order.contractAddress,
      });
    }

    const updatedOrder = db.getOrderById(order.id);

    res.json({
      success: true,
      message: "Delivery evidence bundle stored with cryptographic SHA-256/keccak hash",
      evidence: evidenceRecord,
      order: updatedOrder,
      trade: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST /api/orders/:id/analyze — Run AI multi-vector verification
app.post("/api/orders/:id/analyze", async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const evidence = req.body.evidence || order.evidence;
    if (!evidence) {
      return res.status(400).json({
        success: false,
        error: "No delivery evidence found for this order. Please upload evidence first.",
      });
    }

    // Execute configured AI Provider (Section 19)
    const aiReport = await aiProvider.analyzeEvidence(order, evidence);

    // Save structured AI Review in database
    const reviewRecord = db.createAIReview({
      orderId: order.id,
      evidenceHash: aiReport.evidenceHash,
      reviewHash: aiReport.reviewHash,
      overallScore: aiReport.overallScore,
      recommendation: aiReport.recommendation,
      recommendationCode: aiReport.recommendationCode,
      confidence: aiReport.confidence,
      quantityMatch: aiReport.quantityEvaluation?.result || "MATCH",
      dateMatch: aiReport.dateEvaluation?.result || "MATCH",
      documentConsistency: aiReport.documentConsistency?.status || "MATCH",
      conditionAssessment: aiReport.conditionAssessment?.status || "PASS",
      anomalies: aiReport.anomalies,
      summary: aiReport.summary,
      epistemicBreakdown: aiReport.epistemicBreakdown,
      vectors: aiReport.vectors,
      fullReport: aiReport,
      aiProvider: aiProvider.name,
      validationStatus: aiReport.validationStatus || "VALID",
    });

    const updatedOrder = db.getOrderById(order.id);

    res.json({
      success: true,
      message: "AI 5-Vector verification completed and validated server-side",
      review: reviewRecord,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. GET /api/orders/:id/review — Retrieve latest AI review for order
app.get("/api/orders/:id/review", (req, res) => {
  try {
    const orderId = req.params.id;
    const review = db.getLatestAIReview(orderId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "No AI verification review found for this order",
      });
    }
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. POST /api/orders/:id/attestation — Sign cryptographic EIP-712 attestation
app.post("/api/orders/:id/attestation", async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    let review = db.getLatestAIReview(order.id);
    if (!review) {
      // If not analyzed yet, run analysis now
      const evidence = req.body.evidence || order.evidence;
      if (!evidence) {
        return res.status(400).json({
          success: false,
          error: "Cannot sign attestation without evidence bundle",
        });
      }
      const aiReport = await aiProvider.analyzeEvidence(order, evidence);
      review = db.createAIReview({
        orderId: order.id,
        evidenceHash: aiReport.evidenceHash,
        reviewHash: aiReport.reviewHash,
        overallScore: aiReport.overallScore,
        recommendation: aiReport.recommendation,
        recommendationCode: aiReport.recommendationCode,
        confidence: aiReport.confidence,
        quantityMatch: aiReport.quantityEvaluation?.result || "MATCH",
        dateMatch: aiReport.dateEvaluation?.result || "MATCH",
        documentConsistency: aiReport.documentConsistency?.status || "MATCH",
        conditionAssessment: aiReport.conditionAssessment?.status || "PASS",
        anomalies: aiReport.anomalies,
        summary: aiReport.summary,
        epistemicBreakdown: aiReport.epistemicBreakdown,
        vectors: aiReport.vectors,
        fullReport: aiReport,
        aiProvider: aiProvider.name,
      });
    }

    const contractAddress = req.body.contractAddress || order.contractAddress || process.env.CONTRACT_ADDRESS || "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88";
    const chainId = parseInt(req.body.chainId || order.chainId || 677);

    // Generate cryptographic EIP-712 Oracle signature
    const attestationResult = await oracleSigner.signAttestation({
      orderId: order.id,
      evidenceHash: review.evidenceHash,
      reviewHash: review.reviewHash,
      score: review.overallScore,
      recommendationCode: review.recommendationCode,
      chainId,
      contractAddress,
    });

    const attestationRecord = db.createAIAttestation({
      orderId: order.id,
      reviewId: review.id,
      evidenceHash: review.evidenceHash,
      reviewHash: review.reviewHash,
      score: review.overallScore,
      recommendationCode: review.recommendationCode,
      nonce: attestationResult.attestation.nonce,
      deadline: attestationResult.attestation.deadline,
      signature: attestationResult.signature,
      signerAddress: oracleAddress,
      chainId,
      contractAddress,
      attestation: attestationResult.attestation,
      legacyMessageHash: attestationResult.legacyMessageHash,
      legacySignature: attestationResult.legacySignature,
    });

    const updatedOrder = db.getOrderById(order.id);

    res.json({
      success: true,
      message: "EIP-712 cryptographic AI attestation signed by Oracle",
      attestation: attestationResult,
      attestationRecord,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Attestation signing error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. GET /api/dashboard/stats — Aggregated dashboard statistics
app.get("/api/dashboard/stats", (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. POST /api/orders/:id/transaction — Record onchain transaction
app.post("/api/orders/:id/transaction", (req, res) => {
  try {
    const orderId = req.params.id;
    const { txHash, txType, fromAddress, toAddress, amount, currency, blockNumber, gasUsed, status } = req.body;

    if (!txHash) {
      return res.status(400).json({ success: false, error: "txHash is required" });
    }

    const txRecord = db.createTransaction({
      orderId,
      txHash,
      txType: txType || "CONTRACT_CALL",
      fromAddress,
      toAddress,
      amount,
      currency: currency || "BOT",
      blockNumber,
      gasUsed,
      status: status || "CONFIRMED",
    });

    // Update order status if applicable
    if (txType === "APPROVE_RELEASE" || txType === "RELEASE_FUNDS") {
      db.updateOrderStatus(orderId, "RELEASED", { releaseTxHash: txHash });
    } else if (txType === "FUND_ORDER") {
      db.updateOrderStatus(orderId, "FUNDED", { fundingTxHash: txHash });
    }

    res.json({ success: true, transaction: txRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. POST /api/orders/:id/dispute — Initiate or resolve dispute
app.post("/api/orders/:id/dispute", (req, res) => {
  try {
    const orderId = req.params.id;
    const { initiatorAddress, reasonDescription, disputeTxHash } = req.body;

    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reasonDescription || "TRADE_DISPUTE"));

    const dispute = db.createDispute({
      orderId,
      initiatorAddress: initiatorAddress || "0x0000000000000000000000000000000000000000",
      reasonHash,
      reasonDescription: reasonDescription || "Discrepancy detected in delivered cargo",
    });

    if (disputeTxHash) {
      db.createTransaction({
        orderId,
        txHash: disputeTxHash,
        txType: "DISPUTE",
        fromAddress: initiatorAddress,
        toAddress: process.env.CONTRACT_ADDRESS || "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88",
      });
    }

    res.json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Combined Verify Endpoint (Legacy & Frontend Shortcut)
app.post(["/api/trades/:id/verify", "/api/orders/:id/verify"], async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const evidence = req.body.evidence || order.evidence;
    if (!evidence) {
      return res.status(400).json({
        success: false,
        error: "No delivery evidence provided for verification",
      });
    }

    const aiReport = await aiProvider.analyzeEvidence(order, evidence);

    const reviewRecord = db.createAIReview({
      orderId: order.id,
      evidenceHash: aiReport.evidenceHash,
      reviewHash: aiReport.reviewHash,
      overallScore: aiReport.overallScore,
      recommendation: aiReport.recommendation,
      recommendationCode: aiReport.recommendationCode,
      confidence: aiReport.confidence,
      quantityMatch: aiReport.quantityEvaluation?.result || "MATCH",
      dateMatch: aiReport.dateEvaluation?.result || "MATCH",
      documentConsistency: aiReport.documentConsistency?.status || "MATCH",
      conditionAssessment: aiReport.conditionAssessment?.status || "PASS",
      anomalies: aiReport.anomalies,
      summary: aiReport.summary,
      epistemicBreakdown: aiReport.epistemicBreakdown,
      vectors: aiReport.vectors,
      fullReport: aiReport,
      aiProvider: aiProvider.name,
    });

    const contractAddress = req.body.contractAddress || order.contractAddress || process.env.CONTRACT_ADDRESS || "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88";
    const chainId = parseInt(req.body.chainId || order.chainId || 677);

    const attestation = await oracleSigner.signAttestation({
      orderId: order.id,
      evidenceHash: reviewRecord.evidenceHash,
      reviewHash: reviewRecord.reviewHash,
      score: reviewRecord.overallScore,
      recommendationCode: reviewRecord.recommendationCode,
      chainId,
      contractAddress,
    });

    db.createAIAttestation({
      orderId: order.id,
      reviewId: reviewRecord.id,
      evidenceHash: reviewRecord.evidenceHash,
      reviewHash: reviewRecord.reviewHash,
      score: reviewRecord.overallScore,
      recommendationCode: reviewRecord.recommendationCode,
      nonce: attestation.attestation.nonce,
      deadline: attestation.attestation.deadline,
      signature: attestation.signature,
      signerAddress: oracleAddress,
      chainId,
      contractAddress,
      attestation: attestation.attestation,
      legacyMessageHash: attestation.legacyMessageHash,
      legacySignature: attestation.legacySignature,
    });

    const updatedOrder = db.getOrderById(order.id);

    res.json({
      success: true,
      message: "AI Verification executed and cryptographically attested (EIP-712)",
      review: {
        orderId: aiReport.orderId,
        evidenceHash: aiReport.evidenceHash,
        overallScore: aiReport.overallScore,
        recommendation: aiReport.recommendation,
        recommendationCode: aiReport.recommendationCode,
        quantityMatch: aiReport.quantityEvaluation?.result,
        dateMatch: aiReport.dateEvaluation?.result,
        documentConsistency: aiReport.documentConsistency?.status,
        conditionAssessment: aiReport.conditionAssessment?.status,
        anomalies: aiReport.anomalies,
        confidence: aiReport.confidence,
        reviewedAt: reviewRecord.reviewedAt,
      },
      report: {
        ...reviewRecord,
        attestation,
      },
      attestation,
      order: updatedOrder,
      trade: updatedOrder,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. General Custom Document Scanner
app.post("/api/verify-custom", async (req, res) => {
  try {
    const { po, evidence, contractAddress, chainId } = req.body;
    if (!po || !evidence) {
      return res.status(400).json({
        success: false,
        error: "Both Purchase Order (po) and Evidence (evidence) are required",
      });
    }

    const orderObj = {
      id: po.id || ("0x" + Buffer.from(`CUSTOM-${Date.now()}`).toString("hex").padEnd(64, "0")),
      expectedQuantity: po.expectedQuantity || 10,
      quantityUnit: po.quantityUnit || "Metric Tons",
      deliveryDeadline: po.deliveryDeadline || new Date(Date.now() + 86400000 * 14).toISOString(),
      qualityParameters: po.qualityParameters || {},
    };

    const aiReport = await aiProvider.analyzeEvidence(orderObj, evidence);
    const targetContract = contractAddress || process.env.CONTRACT_ADDRESS || "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88";
    const targetChainId = parseInt(chainId || 677);

    const attestation = await oracleSigner.signAttestation({
      orderId: orderObj.id,
      evidenceHash: aiReport.evidenceHash,
      reviewHash: aiReport.reviewHash,
      score: aiReport.overallScore,
      recommendationCode: aiReport.recommendationCode,
      chainId: targetChainId,
      contractAddress: targetContract,
    });

    res.json({
      success: true,
      review: {
        orderId: aiReport.orderId,
        evidenceHash: aiReport.evidenceHash,
        overallScore: aiReport.overallScore,
        recommendation: aiReport.recommendation,
        recommendationCode: aiReport.recommendationCode,
        quantityMatch: aiReport.quantityEvaluation?.result,
        dateMatch: aiReport.dateEvaluation?.result,
        documentConsistency: aiReport.documentConsistency?.status,
        conditionAssessment: aiReport.conditionAssessment?.status,
        anomalies: aiReport.anomalies,
        confidence: aiReport.confidence,
        reviewedAt: aiReport.reviewedAt,
      },
      report: {
        ...aiReport,
        attestation,
      },
      attestation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server only if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[TradeLock API] Server running on port ${PORT}`);
    console.log(`[TradeLock API] Target Network: BOT Chain Mainnet 677 (https://rpc.botchain.ai)`);
    console.log(`[TradeLock API] Storage: Relational Schema Initialized`);
  });
}

module.exports = app;

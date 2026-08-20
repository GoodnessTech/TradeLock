const http = require("http");
const { ethers } = require("ethers");
const app = require("../index");

async function runBackendIntegrationTests() {
  console.log("==========================================================");
  console.log(" 🧪 TRADELOCK BACKEND API INTEGRATION TEST SUITE");
  console.log(" Testing: REST Endpoints, Relational DB, AI Provider, EIP-712");
  console.log("==========================================================\n");

  const server = http.createServer(app);
  const TEST_PORT = 5099;

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://localhost:${TEST_PORT}`;

  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      failed++;
    }
  }

  try {
    // 1. Health Endpoint
    console.log("--- 1. Health & Protocol Status ---");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    assert(health.status === "ONLINE", "Health status is ONLINE");
    assert(health.network.chainId === 677, "Network is BOT Chain Mainnet 677");
    assert(health.oracle.address.startsWith("0x"), "AI Oracle address is present");

    // 2. Dashboard Stats
    console.log("\n--- 2. Dashboard Stats ---");
    const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`);
    const statsData = await statsRes.json();
    assert(statsData.success === true, "Dashboard stats returned successfully");
    assert(statsData.stats.totalTradesCount >= 3, `Preloaded demo trades seeded: ${statsData.stats.totalTradesCount}`);

    // 3. Create New Purchase Order (POST /api/orders)
    console.log("\n--- 3. Create Purchase Order (POST /api/orders) ---");
    const testPoPayload = {
      title: "15 MT Tanzanian Peaberry Coffee",
      commodity: "Coffee Beans",
      amount: "22000",
      currency: "BOT",
      expectedQuantity: 15,
      quantityUnit: "Metric Tons",
      buyerName: "Test Coffee Roasters",
      buyerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      supplierName: "Kilimanjaro Cooperative",
      supplierAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      originPort: "Port of Dar es Salaam",
      destinationPort: "Port of Antwerp",
      qualityParameters: { moistureMax: 11.5, expectedGrade: "Peaberry Grade 1" },
    };

    const createRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPoPayload),
    });
    const createData = await createRes.json();
    assert(createData.success === true, "Purchase order created in relational database");
    const orderId = createData.order.id;
    assert(orderId.startsWith("0x"), `Generated 32-byte Order ID: ${orderId}`);

    // 4. Fetch Order by ID (GET /api/orders/:id)
    console.log("\n--- 4. Fetch Order by ID (GET /api/orders/:id) ---");
    const fetchOrderRes = await fetch(`${baseUrl}/api/orders/${orderId}`);
    const fetchOrderData = await fetchOrderRes.json();
    assert(fetchOrderData.success === true, "Order retrieved successfully");
    assert(fetchOrderData.order.title === testPoPayload.title, "Order title matches");

    // 5. Submit Evidence (POST /api/orders/:id/evidence)
    console.log("\n--- 5. Submit Delivery Evidence (POST /api/orders/:id/evidence) ---");
    const evidencePayload = {
      billOfLading: {
        blNumber: "MSCU-DAR-ANT-1092",
        carrier: "MSC",
        containerNumber: "MSKU-112233-4",
        sealNumber: "TZ-SEAL-9988",
        netWeight: 15.0,
        issueDate: new Date().toISOString(),
        eta: new Date(Date.now() + 86400000 * 8).toISOString(),
      },
      commercialInvoice: {
        invoiceNumber: "INV-TZ-2026-001",
        quantity: 15.0,
        totalAmount: 22000,
      },
      packingList: {
        containerNumber: "MSKU-112233-4",
        sealNumber: "TZ-SEAL-9988",
        netWeight: 15.0,
      },
      inspectionCertificate: {
        issuer: "SGS Tanzania",
        moistureContent: 10.8,
        grade: "Peaberry Grade 1",
        isCertified: true,
      },
      photos: ["https://example.com/cargo1.jpg"],
    };

    const evidenceRes = await fetch(`${baseUrl}/api/orders/${orderId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evidencePayload),
    });
    const evidenceData = await evidenceRes.json();
    assert(evidenceData.success === true, "Evidence bundle accepted and hashed");
    assert(evidenceData.evidence.evidenceHash.startsWith("0x"), "Evidence hash generated");

    // 6. Analyze Order (POST /api/orders/:id/analyze)
    console.log("\n--- 6. AI Multi-Vector Analysis (POST /api/orders/:id/analyze) ---");
    const analyzeRes = await fetch(`${baseUrl}/api/orders/${orderId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const analyzeData = await analyzeRes.json();
    assert(analyzeData.success === true, "AI 5-Vector analysis completed");
    assert(analyzeData.review.overallScore >= 85, `High confidence score: ${analyzeData.review.overallScore}/100`);
    assert(analyzeData.review.recommendation === "RELEASE_FUNDS", "AI recommendation is RELEASE_FUNDS");

    // 7. Get AI Review (GET /api/orders/:id/review)
    console.log("\n--- 7. Get AI Review (GET /api/orders/:id/review) ---");
    const reviewRes = await fetch(`${baseUrl}/api/orders/${orderId}/review`);
    const reviewData = await reviewRes.json();
    assert(reviewData.success === true, "Review retrieved from relational database");
    assert(reviewData.review.orderId === orderId, "Review belongs to correct order ID");

    // 8. Request AI Cryptographic Attestation (POST /api/orders/:id/attestation)
    console.log("\n--- 8. AI Oracle EIP-712 Attestation (POST /api/orders/:id/attestation) ---");
    const attestationRes = await fetch(`${baseUrl}/api/orders/${orderId}/attestation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const attestationData = await attestationRes.json();
    assert(attestationData.success === true, "EIP-712 attestation signed");
    assert(attestationData.attestation.signature.startsWith("0x"), "ECDSA signature present");

    // Verify signature against AI Oracle address
    const legacyMsg = attestationData.attestation.legacyMessageHash;
    const legacySig = attestationData.attestation.legacySignature;
    const recovered = ethers.verifyMessage(ethers.getBytes(legacyMsg), legacySig);
    assert(recovered.toLowerCase() === health.oracle.address.toLowerCase(), "Attestation signature cryptographically verified");

    // 9. Record Blockchain Transaction (POST /api/orders/:id/transaction)
    console.log("\n--- 9. Record Transaction Hash (POST /api/orders/:id/transaction) ---");
    const sampleTxHash = "0x" + Buffer.from(`TX-TEST-${Date.now()}`).toString("hex").padEnd(64, "0");
    const txRes = await fetch(`${baseUrl}/api/orders/${orderId}/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: sampleTxHash,
        txType: "APPROVE_RELEASE",
        fromAddress: testPoPayload.buyerAddress,
        toAddress: "0x7C87C29d5bB020De0faF3eb2B2B11c1A2fa07B88",
        amount: "22000",
      }),
    });
    const txData = await txRes.json();
    assert(txData.success === true, "Blockchain transaction recorded in database");

    // 10. Live Custom Scanner (POST /api/verify-custom)
    console.log("\n--- 10. Live Custom Scanner (POST /api/verify-custom) ---");
    const customScannerRes = await fetch(`${baseUrl}/api/verify-custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        po: { expectedQuantity: 10, quantityUnit: "MT" },
        evidence: { billOfLading: { netWeight: 10 } },
      }),
    });
    const customData = await customScannerRes.json();
    assert(customData.success === true, "Live custom scanner returned valid attestation");
  } catch (err) {
    console.error("Integration test error:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log("\n==========================================================");
  console.log(` 🏁 BACKEND INTEGRATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendIntegrationTests().catch((e) => {
  console.error(e);
  process.exit(1);
});

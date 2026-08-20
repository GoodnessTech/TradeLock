const { ethers } = require("ethers");
const AIVerifier = require("./services/aiVerifier");
const OracleSigner = require("./services/oracleSigner");
const SAMPLE_TRADES = require("./data/sampleTrades");

async function runAIServiceTests() {
  console.log("==========================================================");
  console.log(" 🤖 TRADELOCK AI REVIEW SERVICE & ORACLE TEST SUITE");
  console.log(" Testing: Quantity, Date, Documents, Images & Epistemic Honesty");
  console.log("==========================================================\n");

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

  const oracleSigner = new OracleSigner();
  const oracleAddress = oracleSigner.getOracleAddress();
  console.log(`[AI Oracle Service] Signer Address: ${oracleAddress}\n`);

  // 1. Compliant RWA Trade (10 MT Cocoa Beans)
  console.log("--- 1. Compliant RWA Trade Verification ---");
  const cocoaTrade = SAMPLE_TRADES[0];
  const cocoaReport = AIVerifier.verifyTrade(cocoaTrade, cocoaTrade.evidence);

  assert(cocoaReport.confidenceScore >= 8500, `High confidence score: ${cocoaReport.confidenceScore} / 10000`);
  assert(cocoaReport.recommendation === "RELEASE_FUNDS", `Recommendation is RELEASE_FUNDS (Code: ${cocoaReport.recommendationCode})`);
  assert(cocoaReport.quantityEvaluation.result === "MATCH", "Quantity evaluates to MATCH");
  assert(cocoaReport.quantityEvaluation.status === "VERIFIED_FROM_EVIDENCE", "Quantity status is VERIFIED_FROM_EVIDENCE");
  assert(cocoaReport.dateEvaluation.result === "MATCH", "Date evaluates to MATCH (delivered before deadline)");
  assert(cocoaReport.dateEvaluation.status === "VERIFIED_FROM_EVIDENCE", "Date status is VERIFIED_FROM_EVIDENCE");
  assert(cocoaReport.documentEvaluation.shipmentDocumentConsistency.result === "MATCH", "Shipment document container and seal match");
  assert(cocoaReport.documentEvaluation.supplierIdentityConsistency.result === "MATCH", "Supplier identity verified");
  assert(cocoaReport.documentEvaluation.destinationCheck.result === "MATCH", "Destination ports match Incoterms");

  // 2. Quantity Partial Match (Expected: 10 tons, Evidence: 9.8 tons -> PARTIAL_MATCH)
  console.log("\n--- 2. Quantity Partial Match Evaluation (10 MT vs 9.8 MT) ---");
  const partialTrade = JSON.parse(JSON.stringify(cocoaTrade));
  partialTrade.expectedQuantity = 10.0;
  partialTrade.quantityUnit = "Metric Tons";
  partialTrade.evidence.billOfLading.netWeight = 9.8; // 2% variance
  const partialReport = AIVerifier.verifyTrade(partialTrade, partialTrade.evidence);

  assert(partialReport.quantityEvaluation.result === "PARTIAL_MATCH", `Quantity result is PARTIAL_MATCH (got: ${partialReport.quantityEvaluation.result})`);
  assert(partialReport.quantityEvaluation.expected === "10 Metric Tons", "Expected quantity is 10 Metric Tons");
  assert(partialReport.quantityEvaluation.evidence === "9.8 Metric Tons", "Evidence quantity is 9.8 Metric Tons");
  assert(partialReport.quantityEvaluation.status === "VERIFIED_FROM_EVIDENCE", "Status is VERIFIED_FROM_EVIDENCE");

  // 3. Date Matching (Required: Aug 19, Evidence: Aug 18 -> MATCH)
  console.log("\n--- 3. Date Matching Evaluation (Required: Aug 19 vs Evidence: Aug 18) ---");
  const dateTrade = JSON.parse(JSON.stringify(cocoaTrade));
  dateTrade.deliveryDeadline = "2026-08-19T23:59:59Z";
  dateTrade.evidence.billOfLading.issueDate = "2026-08-18T10:00:00Z";
  dateTrade.evidence.tracking = { estimatedArrival: "2026-08-18T12:00:00Z" };
  const dateReport = AIVerifier.verifyTrade(dateTrade, dateTrade.evidence);

  assert(dateReport.dateEvaluation.result === "MATCH", `Date result is MATCH (got: ${dateReport.dateEvaluation.result})`);
  assert(dateReport.dateEvaluation.requiredDelivery === "2026-08-19", "Required delivery date: 2026-08-19");
  assert(dateReport.dateEvaluation.evidenceDate === "2026-08-18", "Evidence arrival date: 2026-08-18");
  assert(dateReport.dateEvaluation.status === "VERIFIED_FROM_EVIDENCE", "Date status is VERIFIED_FROM_EVIDENCE");

  // 4. Image Evidence Inspection (Packaging, Stack Count, Damage, Labels)
  console.log("\n--- 4. Image Evidence & Physical Verification ---");
  const imageTrade = JSON.parse(JSON.stringify(cocoaTrade));
  imageTrade.evidence.photoEvidence = {
    packagingType: "Intact 62.5 kg jute sacks on shrink-wrapped Euro pallets",
    stackCount: "160 sacks arranged in 8x20 warehouse staging layout",
    damageDetected: false,
    labelVerified: true,
  };
  const imageReport = AIVerifier.verifyTrade(imageTrade, imageTrade.evidence);

  assert(imageReport.imageEvaluation.hasImageEvidence === true, "Image evidence detected and analyzed");
  assert(imageReport.imageEvaluation.damageAssessment.damageDetected === false, "Zero physical damage detected");
  assert(imageReport.imageEvaluation.labelsAndMarkings.status === "VERIFIED_FROM_EVIDENCE", "Labels verified from evidence");
  assert(imageReport.imageEvaluation.visiblePackaging.status === "VERIFIED_FROM_EVIDENCE", "Visible packaging verified");

  // 5. Epistemic Credibility (VERIFIED_FROM_EVIDENCE vs NOT_VERIFIABLE)
  console.log("\n--- 5. Epistemic Honesty: VERIFIED_FROM_EVIDENCE vs NOT_VERIFIABLE ---");
  const sparseEvidenceTrade = JSON.parse(JSON.stringify(cocoaTrade));
  // Remove photo evidence and inspection certificate to test unverified claims
  delete sparseEvidenceTrade.evidence.inspectionCertificate;
  delete sparseEvidenceTrade.evidence.photoEvidence;
  delete sparseEvidenceTrade.evidence.photos;
  delete sparseEvidenceTrade.evidence.images;

  const sparseReport = AIVerifier.verifyTrade(sparseEvidenceTrade, sparseEvidenceTrade.evidence);

  assert(sparseReport.imageEvaluation.visiblePackaging.status === "NOT_VERIFIABLE", "Missing photos marked NOT_VERIFIABLE rather than fake-verified");
  assert(sparseReport.imageEvaluation.damageAssessment.status === "NOT_VERIFIABLE", "Damage assessment marked NOT_VERIFIABLE");
  assert(sparseReport.epistemicBreakdown.notVerifiableCount > 0, `Explicitly identified ${sparseReport.epistemicBreakdown.notVerifiableCount} unverified claims`);
  assert(sparseReport.epistemicBreakdown.claims.some(c => c.status === "NOT_VERIFIABLE"), "Unverified claims clearly tagged in breakdown");

  // 6. Cryptographic Attestation Proof
  console.log("\n--- 6. Cryptographic Attestation Proof Signing ---");
  const orderId = 1001n;
  const chainId = 677;
  const contractAddress = "0x1234567890123456789012345678901234567890";
  const attestation = await oracleSigner.signVerification(
    orderId,
    cocoaReport.confidenceScore,
    cocoaReport.recommendationCode,
    cocoaReport.reportHash,
    chainId,
    contractAddress
  );

  assert(attestation.signature && attestation.signature.startsWith("0x"), "ECDSA EIP-712 signature generated");

  const recoveredEIP191 = ethers.verifyMessage(
    ethers.getBytes(attestation.legacyMessageHash),
    attestation.legacySignature
  );
  assert(recoveredEIP191.toLowerCase() === oracleAddress.toLowerCase(), "Attestation legacy signature verifies against AI Oracle address");

  const recoveredEIP712 = ethers.verifyTypedData(
    attestation.domain,
    attestation.types,
    {
      orderId: BigInt(attestation.attestation.orderId),
      evidenceHash: attestation.attestation.evidenceHash,
      reviewHash: attestation.attestation.reviewHash,
      score: attestation.attestation.score,
      recommendation: attestation.attestation.recommendation,
      nonce: BigInt(attestation.attestation.nonce),
      deadline: BigInt(attestation.attestation.deadline),
    },
    attestation.signature
  );
  assert(recoveredEIP712.toLowerCase() === oracleAddress.toLowerCase(), "Attestation EIP-712 typed signature verifies against AI Oracle address");

  console.log("\n==========================================================");
  console.log(` 🏁 AI SERVICE TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAIServiceTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

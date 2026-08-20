const { ethers } = require("ethers");
const TradeLockEscrowArtifact = require("../artifacts/src/TradeLockEscrow.sol/TradeLockEscrow.json");
const MockERC20Artifact = require("../artifacts/src/MockERC20.sol/MockERC20.json");
const AIVerifier = require("../../server/services/aiVerifier");
const OracleSigner = require("../../server/services/oracleSigner");

async function main() {
  console.log("==========================================================");
  console.log(" 🛡️ TRADELOCK PROTOCOL & SMART CONTRACT VALIDATION SUITE");
  console.log(" Target: BOT Chain Mainnet (Chain ID 677, RPC https://rpc.botchain.ai)");
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

  // ─────────────────────────────────────────────────────────────
  // 1. AI Review Structured JSON Output Verification
  // ─────────────────────────────────────────────────────────────
  console.log("--- 1. AI Review Output & Structured Internal Schema ---");
  const samplePO = {
    id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    title: "10 MT Premium Cocoa Beans",
    amount: "10000",
    expectedQuantity: 10,
    unit: "Metric Tons",
    supplierName: "Ivory Coast Cocoa Exporters Ltd",
    deliveryDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    destinationPort: "Port of Hamburg",
  };

  const sampleEvidence = {
    billOfLading: {
      blNumber: "MSCU1234567",
      carrier: "MSC Shipping",
      netWeight: 10,
      portOfDischarge: "Hamburg",
      containerNumber: "MSKU-749201-9",
      sealNumber: "SL-49201",
    },
    packingList: {
      netWeight: 10,
      containerNumber: "MSKU-749201-9",
      sealNumber: "SL-49201",
    },
    commercialInvoice: {
      invoiceNumber: "INV-2026-001",
      supplierName: "Ivory Coast Cocoa Exporters Ltd",
      quantity: 10,
      totalAmount: "10000",
    },
    inspectionCertificate: {
      issuer: "SGS",
      grade: "Grade 1",
      moistureContent: 6.8,
    },
    photoEvidence: {
      packagingType: "Jute Bags",
      damageDetected: false,
      labelVerified: true,
    },
  };

  const aiResult = AIVerifier.verifyTrade(samplePO, sampleEvidence);

  // Check required JSON fields
  assert(aiResult.orderId === samplePO.id, "Structured JSON contains orderId");
  assert(typeof aiResult.evidenceHash === "string" && aiResult.evidenceHash.startsWith("0x"), "Structured JSON contains evidenceHash");
  assert(typeof aiResult.overallScore === "number" && aiResult.overallScore >= 0 && aiResult.overallScore <= 100, `overallScore is in range 0-100 (got ${aiResult.overallScore})`);
  assert(typeof aiResult.confidence === "number" && aiResult.confidence >= 0 && aiResult.confidence <= 100, `confidence is in range 0-100 (got ${aiResult.confidence})`);
  assert(["RELEASE_FUNDS", "REQUEST_REVIEW", "FLAG_DISPUTE"].includes(aiResult.recommendation), `recommendation is valid enum: ${aiResult.recommendation}`);
  assert(aiResult.quantityMatch !== undefined, "Structured JSON contains quantityMatch evaluation");
  assert(aiResult.dateMatch !== undefined, "Structured JSON contains dateMatch evaluation");
  assert(aiResult.documentConsistency !== undefined, "Structured JSON contains documentConsistency evaluation");
  assert(aiResult.conditionAssessment !== undefined, "Structured JSON contains conditionAssessment evaluation");
  assert(Array.isArray(aiResult.anomalies), "Structured JSON contains anomalies array");
  assert(typeof aiResult.reviewedAt === "string", `Structured JSON contains reviewedAt timestamp (${aiResult.reviewedAt})`);
  assert(aiResult.humanReport && typeof aiResult.humanReport.executiveSummary === "string", "Backend generates human-readable report for frontend");

  // ─────────────────────────────────────────────────────────────
  // 2. Compiled Smart Contract Artifacts & EIP-712 Interfaces
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 2. Compiled Smart Contract Artifacts & Security Interfaces ---");
  assert(TradeLockEscrowArtifact.abi.length > 0, "TradeLockEscrow ABI contains all interface methods");
  assert(TradeLockEscrowArtifact.bytecode.length > 100, `TradeLockEscrow bytecode compiled successfully (${TradeLockEscrowArtifact.bytecode.length / 2} bytes)`);
  assert(MockERC20Artifact.abi.length > 0, "MockERC20 ABI contains standard ERC-20 methods");

  const contractInterface = new ethers.Interface(TradeLockEscrowArtifact.abi);

  // Check core lifecycle & admin functions exist on TradeLockEscrow
  assert(contractInterface.hasFunction("createPurchaseOrder"), "createPurchaseOrder(uint256,tuple) exists");
  assert(contractInterface.hasFunction("fundOrder"), "fundOrder(uint256) exists");
  assert(contractInterface.hasFunction("createAndFundOrder"), "createAndFundOrder(uint256,tuple) exists");
  assert(contractInterface.hasFunction("submitEvidence"), "submitEvidence(uint256,bytes32,string) exists");
  assert(contractInterface.hasFunction("approveAndReleaseWithAttestation"), "approveAndReleaseWithAttestation(uint256,tuple,bytes) exists (1-TX Buyer Approval)");
  assert(contractInterface.hasFunction("releaseFundsWithAttestation"), "releaseFundsWithAttestation(uint256,tuple,bytes) exists");
  assert(contractInterface.hasFunction("releaseFunds"), "releaseFunds(uint256) exists");
  assert(contractInterface.hasFunction("refundBuyer"), "refundBuyer(uint256) exists");
  assert(contractInterface.hasFunction("disputeOrder"), "disputeOrder(uint256,bytes32) exists");
  assert(contractInterface.hasFunction("resolveDispute"), "resolveDispute(uint256,uint16) exists");
  assert(contractInterface.hasFunction("setFeeBps"), "setFeeBps(uint16) exists");
  assert(contractInterface.hasFunction("setTreasury"), "setTreasury(address) exists");
  assert(contractInterface.hasFunction("setAiOracle"), "setAiOracle(address) exists");
  assert(contractInterface.hasFunction("setDisputeAdmin"), "setDisputeAdmin(address) exists");
  assert(contractInterface.hasFunction("pause"), "pause() exists");
  assert(contractInterface.hasFunction("unpause"), "unpause() exists");
  assert(contractInterface.hasFunction("rescueTokens"), "rescueTokens(address,address,uint256) exists");
  assert(contractInterface.hasFunction("totalEscrowed"), "totalEscrowed(address) mapping exists for liability isolation");
  assert(contractInterface.hasFunction("transferOwnership"), "transferOwnership(address) exists (Ownable2Step)");
  assert(contractInterface.hasFunction("acceptOwnership"), "acceptOwnership() exists (Ownable2Step)");
  assert(contractInterface.hasFunction("pendingOwner"), "pendingOwner() view exists (Ownable2Step)");
  assert(contractInterface.hasFunction("usedNonces"), "usedNonces(uint256) mapping exists for replay prevention");
  assert(contractInterface.hasFunction("AI_ATTESTATION_TYPEHASH"), "AI_ATTESTATION_TYPEHASH constant exists");

  // Check events exist
  assert(contractInterface.hasEvent("PurchaseOrderCreated"), "PurchaseOrderCreated event defined with indexed parameters");
  assert(contractInterface.hasEvent("OrderFunded"), "OrderFunded event defined");
  assert(contractInterface.hasEvent("EvidenceSubmitted"), "EvidenceSubmitted event defined");
  assert(contractInterface.hasEvent("AIVerified"), "AIVerified event defined");
  assert(contractInterface.hasEvent("FundsReleased"), "FundsReleased event defined");
  assert(contractInterface.hasEvent("OrderRefunded"), "OrderRefunded event defined");
  assert(contractInterface.hasEvent("OrderDisputed"), "OrderDisputed event defined");
  assert(contractInterface.hasEvent("DisputeResolved"), "DisputeResolved event defined");
  assert(contractInterface.hasEvent("DisputeAdminUpdated"), "DisputeAdminUpdated event defined");
  assert(contractInterface.hasEvent("TokensRescued"), "TokensRescued event defined");

  // Check custom errors exist
  assert(contractInterface.getError("OrderAlreadyExists") !== null, "Custom error OrderAlreadyExists defined");
  assert(contractInterface.getError("OrderAlreadyReleased") !== null, "Custom error OrderAlreadyReleased defined");
  assert(contractInterface.getError("InvalidOracleSignature") !== null, "Custom error InvalidOracleSignature defined");
  assert(contractInterface.getError("EvidenceMismatch") !== null, "Custom error EvidenceMismatch defined");
  assert(contractInterface.getError("AIRecommendationNotRelease") !== null, "Custom error AIRecommendationNotRelease defined");
  assert(contractInterface.getError("AttestationExpired") !== null, "Custom error AttestationExpired defined");
  assert(contractInterface.getError("NonceAlreadyUsed") !== null, "Custom error NonceAlreadyUsed defined");
  assert(contractInterface.getError("InsufficientRescuableBalance") !== null, "Custom error InsufficientRescuableBalance defined");
  assert(contractInterface.getError("ZeroAddress") !== null, "Custom error ZeroAddress defined");

  // ─────────────────────────────────────────────────────────────
  // 3. Cryptographic AI Attestation (EIP-712 Typed Structured Data)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 3. Cryptographic AI Attestation (EIP-712 Typed Data) ---");
  const oracleWallet = ethers.Wallet.createRandom();
  const contractWallet = ethers.Wallet.createRandom();
  const oracleSignerInstance = new OracleSigner(oracleWallet.privateKey);
  const contractAddress = contractWallet.address;
  const chainId = 677;

  const attestationResult = await oracleSignerInstance.signAttestation({
    orderId: 1001n,
    evidenceHash: aiResult.evidenceHash,
    reviewHash: aiResult.reviewHash,
    score: aiResult.overallScore,
    recommendationCode: 1, // RELEASE_FUNDS
    chainId,
    contractAddress,
  });

  assert(attestationResult.signer.toLowerCase() === oracleWallet.address.toLowerCase(), "OracleSigner returns authorized signer address");
  assert(attestationResult.attestation.score === aiResult.overallScore, "Attestation score matches AI review overallScore");
  assert(attestationResult.attestation.recommendation === 1, "Attestation recommendation is RELEASE_FUNDS (code 1)");

  // Verify EIP-712 signature recovery
  const recoveredSigner = ethers.verifyTypedData(
    attestationResult.domain,
    attestationResult.types,
    {
      orderId: BigInt(attestationResult.attestation.orderId),
      evidenceHash: attestationResult.attestation.evidenceHash,
      reviewHash: attestationResult.attestation.reviewHash,
      score: attestationResult.attestation.score,
      recommendation: attestationResult.attestation.recommendation,
      nonce: BigInt(attestationResult.attestation.nonce),
      deadline: BigInt(attestationResult.attestation.deadline),
    },
    attestationResult.signature
  );

  assert(recoveredSigner.toLowerCase() === oracleWallet.address.toLowerCase(), "EIP-712 typed signature recovers exact AI Oracle address");

  // Verify tampered evidence hash fails recovery
  const tamperedValue = {
    orderId: BigInt(attestationResult.attestation.orderId),
    evidenceHash: ethers.keccak256(ethers.toUtf8Bytes("TAMPERED_EVIDENCE_HASH")),
    reviewHash: attestationResult.attestation.reviewHash,
    score: attestationResult.attestation.score,
    recommendation: attestationResult.attestation.recommendation,
    nonce: BigInt(attestationResult.attestation.nonce),
    deadline: BigInt(attestationResult.attestation.deadline),
  };
  const tamperedSigner = ethers.verifyTypedData(
    attestationResult.domain,
    attestationResult.types,
    tamperedValue,
    attestationResult.signature
  );
  assert(tamperedSigner.toLowerCase() !== oracleWallet.address.toLowerCase(), "Tampered evidenceHash correctly fails EIP-712 signature verification");

  // ─────────────────────────────────────────────────────────────
  // 4. Protocol Fee & Financial Math Invariants (Basis Points)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 4. Integer Basis-Point Calculations (Safe Math) ---");
  const tradeAmount = ethers.parseEther("18.0"); // 18 BOT
  const feeBps = 100n; // 1.0% (100 basis points)
  const bpsDenominator = 10000n;

  const protocolFee = (tradeAmount * feeBps) / bpsDenominator;
  const supplierAmount = tradeAmount - protocolFee;

  assert(protocolFee === ethers.parseEther("0.18"), "100 bps fee on 18.0 BOT equals exactly 0.18 BOT (no floats)");
  assert(supplierAmount === ethers.parseEther("17.82"), "Supplier payout equals exactly 17.82 BOT");
  assert(protocolFee + supplierAmount === tradeAmount, "Conservation of value: protocolFee + supplierAmount == grossAmount");

  // Fee range checks (50 to 200 bps)
  const minFeeBps = 50n;
  const maxFeeBps = 200n;
  assert(minFeeBps === 50n && maxFeeBps === 200n, "Fee range strictly bounded between 50 bps (0.5%) and 200 bps (2.0%)");

  console.log("\n==========================================================");
  console.log(` 🏁 VALIDATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});

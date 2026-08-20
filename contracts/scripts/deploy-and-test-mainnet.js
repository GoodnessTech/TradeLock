const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Contract Artifacts
const EscrowArtifact = require("../artifacts/src/TradeLockEscrow.sol/TradeLockEscrow.json");
const MockERC20Artifact = require("../artifacts/src/MockERC20.sol/MockERC20.json");

async function main() {
  console.log("==========================================================");
  console.log(" 🛡️ TRADELOCK MAINNET DEPLOYMENT & VERIFICATION PIPELINE");
  console.log(" Target: BOT Chain Mainnet (Chain ID: 677)");
  console.log(" RPC: https://rpc.botchain.ai");
  console.log(" Explorer: https://scan.botchain.ai");
  console.log("==========================================================\n");

  const rpcUrl = process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";
  const fetchReq = new ethers.FetchRequest(rpcUrl);
  fetchReq.timeout = 30000;
  fetchReq.retryLimit = 5;
  const provider = new ethers.JsonRpcProvider(fetchReq, 677, { staticNetwork: true });

  let net;
  for (let i = 0; i < 5; i++) {
    try {
      net = await provider.getNetwork();
      break;
    } catch (e) {
      console.log(`[Retry ${i + 1}/5] Connecting to mainnet RPC...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const chainId = Number(net.chainId);
  console.log(`[Network Check] Connected Chain ID: ${chainId}`);
  if (chainId !== 677) {
    throw new Error(`Chain ID mismatch: expected 677 (BOT Chain Mainnet), got ${chainId}`);
  }

  const privKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privKey) throw new Error("No DEPLOYER_PRIVATE_KEY found in .env");

  const wallet = new ethers.Wallet(privKey, provider);
  console.log(`[Deployer / Signer Address]: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`[Deployer Mainnet Balance]: ${ethers.formatEther(balance)} BOT`);
  if (balance < ethers.parseEther("0.005")) {
    throw new Error("Insufficient Mainnet BOT balance for deployment gas");
  }

  const treasuryAddress = process.env.TREASURY_ADDRESS || wallet.address;
  const aiOracleAddress = process.env.AI_ORACLE_ADDRESS || wallet.address;

  const deploymentHashes = [];
  const deployedAddresses = {};

  // ─────────────────────────────────────────────────────────────
  // 1. Deploy Mainnet Payment Token (TradeLock USD - USDt)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 1. Deploying Mainnet Payment Token (TradeLock USDt) ---");
  const tokenFactory = new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, wallet);
  const tokenContract = await tokenFactory.deploy("TradeLock USD", "USDt", 6);
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  const tokenDeployTx = tokenContract.deploymentTransaction();
  deploymentHashes.push({ contract: "Payment Token (USDt)", txHash: tokenDeployTx.hash });
  deployedAddresses.paymentToken = tokenAddress;

  console.log(`  ✅ Mainnet Payment Token Deployed at: ${tokenAddress}`);
  console.log(`  Tx Hash: ${tokenDeployTx.hash}`);
  console.log(`  Explorer: https://scan.botchain.ai/tx/${tokenDeployTx.hash}`);

  // ─────────────────────────────────────────────────────────────
  // 2. Deploy TradeLockEscrow Smart Contract on Mainnet
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 2. Deploying TradeLockEscrow Smart Contract on Mainnet ---");
  const escrowFactory = new ethers.ContractFactory(EscrowArtifact.abi, EscrowArtifact.bytecode, wallet);
  const escrowContract = await escrowFactory.deploy(treasuryAddress, aiOracleAddress);
  await escrowContract.waitForDeployment();
  const escrowAddress = await escrowContract.getAddress();
  const escrowDeployTx = escrowContract.deploymentTransaction();
  deploymentHashes.push({ contract: "TradeLockEscrow", txHash: escrowDeployTx.hash });
  deployedAddresses.escrow = escrowAddress;

  console.log(`  ✅ TradeLockEscrow Deployed at: ${escrowAddress}`);
  console.log(`  Tx Hash: ${escrowDeployTx.hash}`);
  console.log(`  Explorer: https://scan.botchain.ai/tx/${escrowDeployTx.hash}`);

  // ─────────────────────────────────────────────────────────────
  // 3. Configure Mainnet Parameters (Dispute Admin)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 3. Configuring Dispute Admin & Invariants on Mainnet ---");
  const configTx = await escrowContract.setDisputeAdmin(wallet.address);
  await configTx.wait();
  deploymentHashes.push({ action: "setDisputeAdmin", txHash: configTx.hash });
  console.log(`  ✅ Dispute Admin configured: ${wallet.address} (Tx: ${configTx.hash})`);

  // Verify Mainnet Read Calls
  const onchainTreasury = await escrowContract.treasury();
  const onchainOracle = await escrowContract.aiOracle();
  const onchainFee = await escrowContract.feeBps();
  console.log(`  ✅ Onchain Treasury: ${onchainTreasury}`);
  console.log(`  ✅ Onchain AI Oracle: ${onchainOracle}`);
  console.log(`  ✅ Onchain Fee Bps: ${onchainFee} (${Number(onchainFee) / 100}%)`);

  // ─────────────────────────────────────────────────────────────
  // 4. Execute Small Real-Value Mainnet End-to-End Test (0.0001 BOT)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 4. Executing Small Real-Value Mainnet End-to-End Test (0.0001 BOT) ---");
  const mainnetOrderId = BigInt("0x" + Buffer.from(`MAINNET-PO-${Date.now()}`).toString("hex").padEnd(64, "0"));
  const microTradeAmount = ethers.parseEther("0.0001"); // 0.0001 BOT micro-value test
  const block = await provider.getBlock("latest");
  const deadline = block.timestamp + 86400 * 14;
  const supplierAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  const poParams = {
    supplier: supplierAddress,
    token: ethers.ZeroAddress,
    amount: microTradeAmount,
    deliveryDeadline: deadline,
    productCategory: 1, // COMMODITIES
    expectedQuantity: 10000n,
    quantityUnit: 1, // KG
    destination: ethers.encodeBytes32String("DEHAM"),
    orderRef: ethers.encodeBytes32String("MAINNET-LIVE-01"),
    evidenceRequirementsHash: ethers.keccak256(ethers.toUtf8Bytes("COCOA_EXPORT_COMPLIANCE_SPEC")),
  };

  // Step 1: Create & Fund Escrow Order on Mainnet
  console.log("  [Step 1/5] Creating & Funding Escrow with 0.0001 BOT on Mainnet...");
  const createTx = await escrowContract.createAndFundOrder(mainnetOrderId, poParams, { value: microTradeAmount });
  const createReceipt = await createTx.wait();
  console.log(`  ✅ Order Created & Funded on Mainnet! (Tx: ${createReceipt.hash})`);
  console.log(`  Explorer: https://scan.botchain.ai/tx/${createReceipt.hash}`);
  deploymentHashes.push({ action: "createAndFundOrder", txHash: createReceipt.hash });

  let orderState = await escrowContract.getOrder(mainnetOrderId);
  console.log(`  Order Status: ${orderState.status} (2 = FUNDED)`);

  // Step 2: Submit Cargo Delivery Evidence Manifest
  console.log("  [Step 2/5] Submitting Cargo Delivery Evidence Manifest on Mainnet...");
  const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("MAINNET_BL_SGS_CERT_COCOA_2408"));
  const evidenceTx = await escrowContract.submitEvidence(
    mainnetOrderId,
    evidenceHash,
    "ipfs://QmMainnetCocoaEvidenceVerified2408"
  );
  const evidenceReceipt = await evidenceTx.wait();
  console.log(`  ✅ Delivery Evidence Submitted on Mainnet! (Tx: ${evidenceReceipt.hash})`);
  console.log(`  Explorer: https://scan.botchain.ai/tx/${evidenceReceipt.hash}`);
  deploymentHashes.push({ action: "submitEvidence", txHash: evidenceReceipt.hash });

  orderState = await escrowContract.getOrder(mainnetOrderId);
  console.log(`  Order Status: ${orderState.status} (3 = EVIDENCE_SUBMITTED)`);

  // Step 3: AI Oracle EIP-712 Attestation Generation
  console.log("  [Step 3/5] AI Oracle Signing EIP-712 Attestation for Mainnet (Chain 677)...");
  const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("MAINNET_AI_AUDIT_SCORE_98_RELEASE_FUNDS"));
  const attestationNonce = BigInt(Date.now());
  const attestationDeadline = BigInt(Math.floor(Date.now() / 1000) + 86400 * 3);

  const domain = {
    name: "TradeLockEscrow",
    version: "1",
    chainId: 677,
    verifyingContract: escrowAddress,
  };

  const types = {
    AIAttestation: [
      { name: "orderId", type: "uint256" },
      { name: "evidenceHash", type: "bytes32" },
      { name: "reviewHash", type: "bytes32" },
      { name: "score", type: "uint16" },
      { name: "recommendation", type: "uint8" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const attestationPayload = {
    orderId: mainnetOrderId,
    evidenceHash,
    reviewHash,
    score: 98,
    recommendation: 1, // RELEASE_FUNDS
    nonce: attestationNonce,
    deadline: attestationDeadline,
  };

  const aiOracleSignature = await wallet.signTypedData(domain, types, attestationPayload);
  console.log(`  ✅ Mainnet EIP-712 AI Signature Generated: ${aiOracleSignature.slice(0, 20)}...`);

  // Step 4: Buyer Approval & 1-Tx Settlement with Attestation
  console.log("  [Step 4/5] Executing 1-Tx Buyer Settlement on Mainnet...");
  const releaseTx = await escrowContract.approveAndReleaseWithAttestation(
    mainnetOrderId,
    attestationPayload,
    aiOracleSignature
  );
  const releaseReceipt = await releaseTx.wait();
  console.log(`  ✅ Funds Released Onchain on Mainnet! (Tx: ${releaseReceipt.hash})`);
  console.log(`  Explorer: https://scan.botchain.ai/tx/${releaseReceipt.hash}`);
  deploymentHashes.push({ action: "approveAndReleaseWithAttestation", txHash: releaseReceipt.hash });

  orderState = await escrowContract.getOrder(mainnetOrderId);
  console.log(`  Order Status: ${orderState.status} (5 = RELEASED)`);

  // Step 5: Verify Total Liabilities and Balances
  const totalLocked = await escrowContract.totalEscrowed(ethers.ZeroAddress);
  console.log(`  [Step 5/5] Final Escrow Liabilities: ${ethers.formatEther(totalLocked)} BOT (Cleared)`);
  if (totalLocked !== 0n) throw new Error("Mainnet total escrowed balance not cleared!");

  console.log("\n==========================================================");
  console.log(" 🏁 BOT CHAIN MAINNET (677) DEPLOYMENT & E2E TEST: SUCCESS");
  console.log("==========================================================");

  const report = {
    network: "BOT Chain Mainnet",
    chainId: 677,
    rpcUrl: "https://rpc.botchain.ai",
    explorerUrl: "https://scan.botchain.ai",
    tradeLockEscrow: escrowAddress,
    paymentToken: tokenAddress,
    aiSigner: wallet.address,
    treasury: treasuryAddress,
    deploymentHashes,
    smallMainnetTransaction: {
      orderId: "0x" + mainnetOrderId.toString(16),
      amount: "0.0001 BOT",
      createTx: createReceipt.hash,
      evidenceTx: evidenceReceipt.hash,
      releaseTx: releaseReceipt.hash,
      status: "RELEASED",
    },
    status: "PASS",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(__dirname, "mainnet-deployment-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return report;
}

main().catch((err) => {
  console.error("\n❌ MAINNET DEPLOYMENT ERROR:", err);
  process.exit(1);
});

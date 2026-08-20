const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Contract Artifacts
const EscrowArtifact = require("../artifacts/src/TradeLockEscrow.sol/TradeLockEscrow.json");
const MockERC20Artifact = require("../artifacts/src/MockERC20.sol/MockERC20.json");

async function main() {
  console.log("==========================================================");
  console.log(" 🚀 TRADELOCK TESTNET DEPLOYMENT & E2E PROTOCOL PIPELINE");
  console.log(" Target: BOT Chain Testnet (Chain ID: 968)");
  console.log(" RPC: https://rpc.bohr.life");
  console.log(" Explorer: https://scan.bohr.life");
  console.log("==========================================================\n");

  const rpcUrl = process.env.BOTCHAIN_TESTNET_RPC_URL || "https://rpc.bohr.life";
  const fetchReq = new ethers.FetchRequest(rpcUrl);
  fetchReq.timeout = 30000;
  fetchReq.retryLimit = 5;
  const provider = new ethers.JsonRpcProvider(fetchReq, 968, { staticNetwork: true });

  let net;
  for (let i = 0; i < 5; i++) {
    try {
      net = await provider.getNetwork();
      break;
    } catch (e) {
      console.log(`[Retry ${i + 1}/5] Reconnecting to testnet RPC...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const chainId = Number(net.chainId);
  console.log(`[Network Check] Connected Chain ID: ${chainId}`);
  if (chainId !== 968) {
    throw new Error(`Chain ID mismatch: expected 968 (BOT Chain Testnet), got ${chainId}`);
  }

  const privKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privKey) throw new Error("No DEPLOYER_PRIVATE_KEY found in .env");

  const wallet = new ethers.Wallet(privKey, provider);
  console.log(`[Deployer / Signer Address]: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`[Deployer Testnet Balance]: ${ethers.formatEther(balance)} BOT`);
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient Testnet BOT balance for deployment gas");
  }

  const treasuryAddress = process.env.TREASURY_ADDRESS || wallet.address;
  const aiOracleAddress = process.env.AI_ORACLE_ADDRESS || wallet.address;

  const deploymentHashes = [];
  const deployedAddresses = {};

  // ─────────────────────────────────────────────────────────────
  // 1. Deploy Testnet Payment Token (MockERC20 tUSD)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 1. Deploying Testnet Payment Token (tUSD) ---");
  const tokenFactory = new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, wallet);
  const tokenContract = await tokenFactory.deploy("TradeLock USD", "tUSD", 6);
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  const tokenDeployTx = tokenContract.deploymentTransaction();
  deploymentHashes.push({ contract: "Testnet Payment Token (tUSD)", txHash: tokenDeployTx.hash });
  deployedAddresses.paymentToken = tokenAddress;

  console.log(`  ✅ Payment Token Deployed at: ${tokenAddress}`);
  console.log(`  Tx Hash: ${tokenDeployTx.hash}`);
  console.log(`  Explorer: https://scan.bohr.life/tx/${tokenDeployTx.hash}`);

  // ─────────────────────────────────────────────────────────────
  // 2. Deploy TradeLockEscrow Smart Contract
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 2. Deploying TradeLockEscrow Smart Contract ---");
  const escrowFactory = new ethers.ContractFactory(EscrowArtifact.abi, EscrowArtifact.bytecode, wallet);
  const escrowContract = await escrowFactory.deploy(treasuryAddress, aiOracleAddress);
  await escrowContract.waitForDeployment();
  const escrowAddress = await escrowContract.getAddress();
  const escrowDeployTx = escrowContract.deploymentTransaction();
  deploymentHashes.push({ contract: "TradeLockEscrow", txHash: escrowDeployTx.hash });
  deployedAddresses.escrow = escrowAddress;

  console.log(`  ✅ TradeLockEscrow Deployed at: ${escrowAddress}`);
  console.log(`  Tx Hash: ${escrowDeployTx.hash}`);
  console.log(`  Explorer: https://scan.bohr.life/tx/${escrowDeployTx.hash}`);

  // ─────────────────────────────────────────────────────────────
  // 3. Configure Protocol Parameters (Dispute Admin)
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 3. Configuring Dispute Admin & Invariants ---");
  const configTx = await escrowContract.setDisputeAdmin(wallet.address);
  await configTx.wait();
  deploymentHashes.push({ action: "setDisputeAdmin", txHash: configTx.hash });
  console.log(`  ✅ Dispute Admin configured: ${wallet.address} (Tx: ${configTx.hash})`);

  // Verify Initial Read Calls on Testnet
  const onchainTreasury = await escrowContract.treasury();
  const onchainOracle = await escrowContract.aiOracle();
  const onchainFee = await escrowContract.feeBps();
  console.log(`  ✅ Onchain Treasury: ${onchainTreasury}`);
  console.log(`  ✅ Onchain AI Oracle: ${onchainOracle}`);
  console.log(`  ✅ Onchain Fee Bps: ${onchainFee} (${Number(onchainFee) / 100}%)`);

  // ─────────────────────────────────────────────────────────────
  // 4. Run Complete End-to-End TradeLock Flow on Testnet
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- 4. Executing Complete E2E Escrow Flow on BOT Chain Testnet ---");
  const testOrderId = BigInt("0x" + Buffer.from(`TESTNET-PO-${Date.now()}`).toString("hex").padEnd(64, "0"));
  const tradeAmount = ethers.parseEther("0.001"); // 0.001 BOT
  const block = await provider.getBlock("latest");
  const deadline = block.timestamp + 86400 * 14;
  const supplierAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  const poParams = {
    supplier: supplierAddress,
    token: ethers.ZeroAddress,
    amount: tradeAmount,
    deliveryDeadline: deadline,
    productCategory: 1,
    expectedQuantity: 10000n,
    quantityUnit: 1,
    destination: ethers.encodeBytes32String("DEHAM"),
    orderRef: ethers.encodeBytes32String("PO-COCOA-2408"),
    evidenceRequirementsHash: ethers.keccak256(ethers.toUtf8Bytes("COCOA_GRADE_1_SPECS")),
  };

  // Step 1: Create & Fund Escrow Order
  console.log("  [Step 1/5] Creating & Funding Escrow (0.001 BOT)...");
  const createTx = await escrowContract.createAndFundOrder(testOrderId, poParams, { value: tradeAmount });
  const createReceipt = await createTx.wait();
  console.log(`  ✅ Order Created & Funded! (Tx: ${createReceipt.hash})`);
  deploymentHashes.push({ action: "createAndFundOrder", txHash: createReceipt.hash });

  let orderState = await escrowContract.getOrder(testOrderId);
  console.log(`  Order Status: ${orderState.status} (2 = FUNDED)`);

  // Step 2: Supplier Submits Evidence
  console.log("  [Step 2/5] Submitting Cargo Delivery Evidence Manifest...");
  const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("EVIDENCE_BL_PACKING_SGS_TESTNET_2408"));
  const evidenceTx = await escrowContract.submitEvidence(testOrderId, evidenceHash, "ipfs://QmTestnetCocoaEvidence");
  const evidenceReceipt = await evidenceTx.wait();
  console.log(`  ✅ Evidence Submitted! (Tx: ${evidenceReceipt.hash})`);
  deploymentHashes.push({ action: "submitEvidence", txHash: evidenceReceipt.hash });

  orderState = await escrowContract.getOrder(testOrderId);
  console.log(`  Order Status: ${orderState.status} (3 = EVIDENCE_SUBMITTED)`);

  // Step 3: AI Oracle Reviews & Cryptographically Attests (EIP-712)
  console.log("  [Step 3/5] AI Oracle Generating EIP-712 Attestation Proof...");
  const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("AI_REVIEW_SCORE_96_RELEASE_FUNDS"));
  const attestationNonce = BigInt(Date.now());
  const attestationDeadline = BigInt(Math.floor(Date.now() / 1000) + 86400 * 3);

  const domain = {
    name: "TradeLockEscrow",
    version: "1",
    chainId: 968,
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
    orderId: testOrderId,
    evidenceHash,
    reviewHash,
    score: 96,
    recommendation: 1, // RELEASE_FUNDS
    nonce: attestationNonce,
    deadline: attestationDeadline,
  };

  const aiOracleSignature = await wallet.signTypedData(domain, types, attestationPayload);
  console.log(`  ✅ EIP-712 AI Signature Generated: ${aiOracleSignature.slice(0, 20)}...`);

  // Step 4: Buyer Single-Transaction Approval & Release with Attestation
  console.log("  [Step 4/5] Buyer Authorizing 1-Tx Settlement with EIP-712 Attestation...");
  const releaseTx = await escrowContract.approveAndReleaseWithAttestation(
    testOrderId,
    attestationPayload,
    aiOracleSignature
  );
  const releaseReceipt = await releaseTx.wait();
  console.log(`  ✅ Funds Released Onchain! (Tx: ${releaseReceipt.hash})`);
  deploymentHashes.push({ action: "approveAndReleaseWithAttestation", txHash: releaseReceipt.hash });

  orderState = await escrowContract.getOrder(testOrderId);
  console.log(`  Order Status: ${orderState.status} (5 = RELEASED)`);

  // Step 5: Verify Final Balances and Fee Accounting
  const totalLocked = await escrowContract.totalEscrowed(ethers.ZeroAddress);
  console.log(`  [Step 5/5] Final Escrow Liabilities: ${ethers.formatEther(totalLocked)} BOT (Cleared)`);
  if (totalLocked !== 0n) throw new Error("Total escrowed balance not cleared upon release!");

  console.log("\n==========================================================");
  console.log(" 🏁 BOT CHAIN TESTNET (968) DEPLOYMENT & E2E TEST: SUCCESS");
  console.log("==========================================================");

  // Save deployment receipt to json
  const report = {
    network: "BOT Chain Testnet",
    chainId: 968,
    rpcUrl: "https://rpc.bohr.life",
    explorerUrl: "https://scan.bohr.life",
    tradeLockEscrow: escrowAddress,
    paymentToken: tokenAddress,
    aiSigner: wallet.address,
    treasury: treasuryAddress,
    deploymentHashes,
    e2eTestOrderId: "0x" + testOrderId.toString(16),
    status: "PASS",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(__dirname, "testnet-deployment-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return report;
}

main().catch((err) => {
  console.error("\n❌ TESTNET DEPLOYMENT ERROR:", err);
  process.exit(1);
});

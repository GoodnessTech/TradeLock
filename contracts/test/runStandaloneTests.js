const { ethers } = require("hardhat");
const OracleSigner = require("../../server/services/oracleSigner");

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 RUNNING TRADELOCK SECURITY & ESCROW AUDIT TEST SUITE");
  console.log(" Testing Target: BOT Chain Mainnet 677 Compliant EVM");
  console.log("==========================================================\n");

  const [owner, buyer, supplier, treasury, aiOracle, disputeAdmin, newOwner, attacker] = await ethers.getSigners();

  console.log(`[Account Setup] Owner: ${owner.address}`);
  console.log(`[Account Setup] Buyer: ${buyer.address}`);
  console.log(`[Account Setup] Supplier: ${supplier.address}`);
  console.log(`[Account Setup] Treasury: ${treasury.address}`);
  console.log(`[Account Setup] AI Oracle: ${aiOracle.address}`);
  console.log(`[Account Setup] Dispute Admin: ${disputeAdmin.address}`);
  console.log(`[Account Setup] Attacker: ${attacker.address}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // 1. Contract Deployment & Configuration
    // ─────────────────────────────────────────────────────────────
    console.log("--- 1. Contract Deployment & Initial State ---");
    const EscrowFactory = await ethers.getContractFactory("TradeLockEscrow");
    const escrow = await EscrowFactory.deploy(treasury.address, aiOracle.address);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log(`  Deployed TradeLockEscrow at: ${escrowAddress}`);

    assert((await escrow.treasury()).toLowerCase() === treasury.address.toLowerCase(), "Treasury address initialized correctly");
    assert((await escrow.aiOracle()).toLowerCase() === aiOracle.address.toLowerCase(), "AI Oracle address initialized correctly");
    assert((await escrow.feeBps()) === 100n, "Default fee is 100 bps (1.0%)");
    assert((await escrow.owner()).toLowerCase() === owner.address.toLowerCase(), "Owner initialized to deployer");

    // Configure dedicated disputeAdmin
    await (await escrow.connect(owner).setDisputeAdmin(disputeAdmin.address)).wait();
    assert((await escrow.disputeAdmin()).toLowerCase() === disputeAdmin.address.toLowerCase(), "Dispute admin configured successfully");

    // ─────────────────────────────────────────────────────────────
    // 2. Ownable2Step Two-Step Ownership Transfer
    // ─────────────────────────────────────────────────────────────
    console.log("\n--- 2. Ownable2Step Access Control ---");
    // Non-owner cannot initiate transfer
    let nonOwnerTransferReverted = false;
    try {
      await escrow.connect(attacker).transferOwnership(attacker.address);
    } catch (e) {
      nonOwnerTransferReverted = true;
    }
    assert(nonOwnerTransferReverted, "Non-owner cannot initiate ownership transfer");

    // Owner initiates transfer to newOwner
    await (await escrow.connect(owner).transferOwnership(newOwner.address)).wait();
    assert((await escrow.pendingOwner()).toLowerCase() === newOwner.address.toLowerCase(), "Pending owner set to newOwner");
    assert((await escrow.owner()).toLowerCase() === owner.address.toLowerCase(), "Current owner remains unchanged until acceptance");

    // Attacker cannot accept ownership
    let attackerAcceptReverted = false;
    try {
      await escrow.connect(attacker).acceptOwnership();
    } catch (e) {
      attackerAcceptReverted = true;
    }
    assert(attackerAcceptReverted, "Unauthorized party cannot accept ownership");

    // newOwner accepts ownership
    await (await escrow.connect(newOwner).acceptOwnership()).wait();
    assert((await escrow.owner()).toLowerCase() === newOwner.address.toLowerCase(), "newOwner successfully accepted ownership");
    assert((await escrow.pendingOwner()) === ethers.ZeroAddress, "Pending owner reset to zero address");

    // Transfer back to original owner for remaining tests
    await (await escrow.connect(newOwner).transferOwnership(owner.address)).wait();
    await (await escrow.connect(owner).acceptOwnership()).wait();
    assert((await escrow.owner()).toLowerCase() === owner.address.toLowerCase(), "Ownership returned to original owner");

    // ─────────────────────────────────────────────────────────────
    // 3. Pausable Security Enforcement
    // ─────────────────────────────────────────────────────────────
    console.log("\n--- 3. Pausable Protocol Circuit Breaker ---");
    await (await escrow.connect(owner).pause()).wait();
    assert(await escrow.paused(), "Protocol is paused by owner");

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 86400 * 14;
    const poRequirementsHash = ethers.keccak256(ethers.toUtf8Bytes("COCOA_GRADE_1_SPECS"));
    const destination = ethers.encodeBytes32String("DEHAM");
    const orderRef = ethers.encodeBytes32String("PO-COCOA-01");
    const testAmount = ethers.parseEther("10.0");

    const poParams = {
      supplier: supplier.address,
      token: ethers.ZeroAddress,
      amount: testAmount,
      deliveryDeadline: deadline,
      productCategory: 1,
      expectedQuantity: 10000n,
      quantityUnit: 1,
      destination,
      orderRef,
      evidenceRequirementsHash: poRequirementsHash,
    };

    // Creating order when paused must revert
    let pauseReverted = false;
    try {
      await escrow.connect(buyer).createAndFundOrder(2001n, poParams, { value: testAmount });
    } catch (e) {
      pauseReverted = true;
    }
    assert(pauseReverted, "State-modifying actions strictly blocked while paused (EnforcedPause)");

    // Unpause protocol
    await (await escrow.connect(owner).unpause()).wait();
    assert(!(await escrow.paused()), "Protocol successfully unpaused by owner");

    // ─────────────────────────────────────────────────────────────
    // 4. Token Deployments & Escrow Liability Tracking
    // ─────────────────────────────────────────────────────────────
    console.log("\n--- 4. Mock ERC20 Token & Safe Liability Accounting ---");
    const TokenFactory = await ethers.getContractFactory("MockERC20");
    const mockToken = await TokenFactory.deploy("TradeLock USD", "tUSD", 6);
    await mockToken.waitForDeployment();
    const tokenAddress = await mockToken.getAddress();

    await mockToken.mint(buyer.address, ethers.parseUnits("50000", 6));
    await mockToken.mint(attacker.address, ethers.parseUnits("10000", 6)); // Accidental deposit test
    assert((await mockToken.balanceOf(buyer.address)) === ethers.parseUnits("50000", 6), "Buyer funded with 50,000 tUSD");

    // ─────────────────────────────────────────────────────────────
    // 5. Native BOT Order: 1-TX EIP-712 Attestation Settlement
    // ─────────────────────────────────────────────────────────────
    console.log("\n--- 5. Native BOT 1-TX Buyer Approval & EIP-712 Attestation Release ---");
    const orderId = 1001n;
    const tradeAmount = ethers.parseEther("18.0"); // 18 BOT
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("EVIDENCE_BL_INV_SGS_BUNDLE_1001"));
    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("AI_REVIEW_HASH_1001"));

    const nativeParams = {
      ...poParams,
      amount: tradeAmount,
      evidenceRequirementsHash: poRequirementsHash,
    };

    // Create & Fund Purchase Order
    await (await escrow.connect(buyer).createAndFundOrder(orderId, nativeParams, { value: tradeAmount })).wait();
    let order = await escrow.getOrder(orderId);
    assert(order.status === 2n, "Order status is FUNDED (enum 2)");
    assert(order.buyer.toLowerCase() === buyer.address.toLowerCase(), "Buyer locked to order");
    assert(order.supplier.toLowerCase() === supplier.address.toLowerCase(), "Supplier locked to order");
    assert((await escrow.totalEscrowed(ethers.ZeroAddress)) === tradeAmount, "totalEscrowed tracks active native liability (18.0 BOT)");

    // Supplier submits evidence
    await (await escrow.connect(supplier).submitEvidence(orderId, evidenceHash, "ipfs://QmCocoaEvidence")).wait();
    order = await escrow.getOrder(orderId);
    assert(order.status === 3n, "Order status is EVIDENCE_SUBMITTED (enum 3)");

    // AI Oracle creates EIP-712 typed attestation
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const domain = {
      name: "TradeLockEscrow",
      version: "1",
      chainId: Number(chainId),
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

    const attestationNonce = 987654321n;
    const attestationDeadline = BigInt(Math.floor(Date.now() / 1000) + 86400 * 2);
    const attestationPayload = {
      orderId,
      evidenceHash,
      reviewHash,
      score: 97,
      recommendation: 1, // RELEASE_FUNDS
      nonce: attestationNonce,
      deadline: attestationDeadline,
    };

    const aiOracleSignature = await aiOracle.signTypedData(domain, types, attestationPayload);

    const initialSupplierBal = await ethers.provider.getBalance(supplier.address);
    const initialTreasuryBal = await ethers.provider.getBalance(treasury.address);

    // Buyer approves and releases in 1 single transaction
    const releaseTx = await escrow.connect(buyer).approveAndReleaseWithAttestation(
      orderId,
      attestationPayload,
      aiOracleSignature
    );
    await releaseTx.wait();

    order = await escrow.getOrder(orderId);
    assert(order.status === 5n, "Order status marked RELEASED (enum 5)");
    assert((await escrow.totalEscrowed(ethers.ZeroAddress)) === 0n, "totalEscrowed cleared upon settlement (0 BOT)");
    assert((await escrow.usedNonces(attestationNonce)) === true, "Attestation nonce marked used onchain");

    const finalSupplierBal = await ethers.provider.getBalance(supplier.address);
    const finalTreasuryBal = await ethers.provider.getBalance(treasury.address);

    const expectedFee = (tradeAmount * 100n) / 10000n; // 0.18 BOT (1.0% fee)
    const expectedNet = tradeAmount - expectedFee; // 17.82 BOT (99.0% supplier)

    assert(finalSupplierBal - initialSupplierBal === expectedNet, "Supplier received exact 99.0% net payout (17.82 BOT)");
    assert(finalTreasuryBal - initialTreasuryBal === expectedFee, "Treasury received exact 1.0% protocol fee (0.18 BOT)");

    // ─────────────────────────────────────────────────────────────
    // 6. Security Invariants: Zero-Theft & Safe Token Rescue
    // ─────────────────────────────────────────────────────────────
    console.log("\n--- 6. Admin Escrow Isolation & Safe Token Rescue ---");
    const erc20OrderId = 1002n;
    const erc20Amount = ethers.parseUnits("30000", 6); // 30,000 tUSD

    const erc20Params = {
      ...nativeParams,
      token: tokenAddress,
      amount: erc20Amount,
    };

    // Buyer funds 30,000 tUSD escrow
    await (await mockToken.connect(buyer).approve(escrowAddress, erc20Amount)).wait();
    await (await escrow.connect(buyer).createAndFundOrder(erc20OrderId, erc20Params)).wait();
    assert((await escrow.totalEscrowed(tokenAddress)) === erc20Amount, "totalEscrowed tracks 30,000 tUSD locked escrow");

    // Admin CANNOT rescue active user escrow funds
    let stealAttemptReverted = false;
    try {
      await escrow.connect(owner).rescueTokens(tokenAddress, owner.address, erc20Amount);
    } catch (e) {
      stealAttemptReverted = true;
    }
    assert(stealAttemptReverted, "Admin CANNOT rescue active escrow funds (InsufficientRescuableBalance)");

    // Someone accidentally sends 5,000 tUSD directly to escrow contract
    const accidentalAmount = ethers.parseUnits("5000", 6);
    await (await mockToken.connect(attacker).transfer(escrowAddress, accidentalAmount)).wait();

    const totalContractBal = await mockToken.balanceOf(escrowAddress);
    assert(totalContractBal === erc20Amount + accidentalAmount, "Contract holds 35,000 tUSD (30,000 locked + 5,000 excess)");

    // Admin can safely rescue ONLY the 5,000 excess tokens
    const initialOwnerTokenBal = await mockToken.balanceOf(owner.address);
    await (await escrow.connect(owner).rescueTokens(tokenAddress, owner.address, accidentalAmount)).wait();
    const finalOwnerTokenBal = await mockToken.balanceOf(owner.address);
    assert(finalOwnerTokenBal - initialOwnerTokenBal === accidentalAmount, "Admin successfully rescued 5,000 excess tokens");

    // After rescue, active 30,000 tUSD remains fully intact
    assert((await mockToken.balanceOf(escrowAddress)) === erc20Amount, "Active 30,000 tUSD user escrow remains 100% intact");

    // ─────────────────────────────────────────────────────────────
    // 7. Dispute Lifecycle & Arbitrator Role Protection
    // ─────────────────────────────────────────────────────────────
    console.log("\n--- 7. Dispute Resolution & Anti-Diversion Invariants ---");
    // Buyer disputes the 30,000 tUSD order
    const disputeReason = ethers.keccak256(ethers.toUtf8Bytes("SEAL_TAMPERED_CONTAINER_BROKEN"));
    await (await escrow.connect(buyer).disputeOrder(erc20OrderId, disputeReason)).wait();
    order = await escrow.getOrder(erc20OrderId);
    assert(order.status === 7n, "Order marked DISPUTED (enum 7)");

    // Attacker cannot resolve dispute
    let attackerResolveReverted = false;
    try {
      await escrow.connect(attacker).resolveDispute(erc20OrderId, 5000);
    } catch (e) {
      attackerResolveReverted = true;
    }
    assert(attackerResolveReverted, "Unauthorized party cannot resolve dispute");

    // Dispute admin resolves dispute (60% buyer, 40% supplier)
    const initialBuyerTokens = await mockToken.balanceOf(buyer.address);
    const initialSupplierTokens = await mockToken.balanceOf(supplier.address);
    const initialTreasuryTokens = await mockToken.balanceOf(treasury.address);

    const disputeTx = await escrow.connect(disputeAdmin).resolveDispute(erc20OrderId, 6000); // 60.00% buyer
    await disputeTx.wait();

    order = await escrow.getOrder(erc20OrderId);
    assert(order.status === 5n, "Disputed order settled to RELEASED (enum 5)");
    assert((await escrow.totalEscrowed(tokenAddress)) === 0n, "totalEscrowed cleared for resolved dispute");

    const tokenFee = (erc20Amount * 100n) / 10000n; // 300 tUSD (1.0%)
    const netTrade = erc20Amount - tokenFee; // 29,700 tUSD
    const expectedBuyerShare = (netTrade * 6000n) / 10000n; // 17,820 tUSD
    const expectedSupplierShare = netTrade - expectedBuyerShare; // 11,880 tUSD

    const finalBuyerTokens = await mockToken.balanceOf(buyer.address);
    const finalSupplierTokens = await mockToken.balanceOf(supplier.address);
    const finalTreasuryTokens = await mockToken.balanceOf(treasury.address);

    assert(finalBuyerTokens - initialBuyerTokens === expectedBuyerShare, "Buyer received exact 60.0% share (17,820 tUSD)");
    assert(finalSupplierTokens - initialSupplierTokens === expectedSupplierShare, "Supplier received exact 40.0% share (11,880 tUSD)");
    assert(finalTreasuryTokens - initialTreasuryTokens === tokenFee, "Treasury received exact protocol fee (300 tUSD)");

    // Double resolution / double release prevention
    let doubleReleaseReverted = false;
    try {
      await escrow.connect(disputeAdmin).resolveDispute(erc20OrderId, 6000);
    } catch (e) {
      doubleReleaseReverted = true;
    }
    assert(doubleReleaseReverted, "Double dispute resolution strictly prevented (InvalidStatus)");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  }

  console.log("\n==========================================================");
  console.log(` 🏁 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});

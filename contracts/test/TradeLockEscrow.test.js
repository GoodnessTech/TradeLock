const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TradeLockEscrow Contract (Gas-Optimized Onchain Data Model)", function () {
  let TradeLockEscrow;
  let escrow;
  let MockERC20;
  let mockToken;
  let owner, buyer, supplier, treasury, aiOracle, attacker;

  const ORDER_ID = 1001n;
  const PO_REQUIREMENTS_HASH = ethers.keccak256(ethers.toUtf8Bytes("COCOA_GRADE_A_SPECS_MOISTURE_7.5_MAX"));
  const EVIDENCE_HASH = ethers.keccak256(ethers.toUtf8Bytes("EVIDENCE_BL_INVOICE_SGS_CERTIFICATE_BUNDLE"));
  const AI_REVIEW_HASH = ethers.keccak256(ethers.toUtf8Bytes("AI_EVALUATION_REPORT_GRADE_A_COCOA_MATCH_100PCT"));
  const DESTINATION = ethers.encodeBytes32String("DEHAM"); // Port of Hamburg
  const ORDER_REF = ethers.encodeBytes32String("PO-2026-COCOA");

  beforeEach(async function () {
    [owner, buyer, supplier, treasury, aiOracle, attacker] = await ethers.getSigners();

    const EscrowFactory = await ethers.getContractFactory("TradeLockEscrow");
    escrow = await EscrowFactory.deploy(treasury.address, aiOracle.address);
    await escrow.waitForDeployment();

    const TokenFactory = await ethers.getContractFactory("MockERC20");
    mockToken = await TokenFactory.deploy("USD Stablecoin", "USDC", 6);
    await mockToken.waitForDeployment();

    // Fund buyer with mock USDC
    await mockToken.mint(buyer.address, ethers.parseUnits("50000", 6));
  });

  describe("Initialization & Storage Layout", function () {
    it("should set correct treasury, oracle, and fee configuration", async function () {
      expect(await escrow.treasury()).to.equal(treasury.address);
      expect(await escrow.aiOracle()).to.equal(aiOracle.address);
      expect(await escrow.feeBps()).to.equal(100); // 1.0%
    });

    it("should allow owner to update fee within bounds (50 to 200 bps)", async function () {
      await expect(escrow.setFeeBps(150))
        .to.emit(escrow, "FeeUpdated")
        .withArgs(150);
      expect(await escrow.feeBps()).to.equal(150);

      // Revert below 50 bps with custom error
      await expect(escrow.setFeeBps(40)).to.be.revertedWithCustomError(escrow, "FeeOutOfBounds");
      // Revert above 200 bps with custom error
      await expect(escrow.setFeeBps(250)).to.be.revertedWithCustomError(escrow, "FeeOutOfBounds");
    });

    it("should reject non-owner fee update", async function () {
      await expect(
        escrow.connect(attacker).setFeeBps(150)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Purchase Order Lifecycle (Native BOT Token)", function () {
    const tradeAmount = ethers.parseEther("10.0"); // 10 BOT
    let deadline;
    let poParams;

    beforeEach(async function () {
      const block = await ethers.provider.getBlock("latest");
      deadline = block.timestamp + 86400 * 7; // 7 days

      poParams = {
        supplier: supplier.address,
        token: ethers.ZeroAddress,
        amount: tradeAmount,
        deliveryDeadline: deadline,
        productCategory: 1, // Agricultural Commodities
        expectedQuantity: 10000n, // 10.000 MT
        quantityUnit: 1, // MT
        destination: DESTINATION,
        orderRef: ORDER_REF,
        evidenceRequirementsHash: PO_REQUIREMENTS_HASH,
      };
    });

    it("should create purchase order and emit PurchaseOrderCreated", async function () {
      await expect(
        escrow.connect(buyer).createPurchaseOrder(ORDER_ID, poParams)
      )
        .to.emit(escrow, "PurchaseOrderCreated")
        .withArgs(
          ORDER_ID,
          buyer.address,
          supplier.address,
          ethers.ZeroAddress,
          tradeAmount,
          deadline,
          1,
          10000n,
          1,
          DESTINATION,
          ORDER_REF,
          PO_REQUIREMENTS_HASH
        );

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.supplier).to.equal(supplier.address);
      expect(order.amount).to.equal(tradeAmount);
      expect(order.status).to.equal(1); // CREATED
      expect(order.evidenceRequirementsHash).to.equal(PO_REQUIREMENTS_HASH);
    });

    it("should fund purchase order with native BOT token", async function () {
      await escrow.connect(buyer).createPurchaseOrder(ORDER_ID, poParams);

      await expect(
        escrow.connect(buyer).fundOrder(ORDER_ID, { value: tradeAmount })
      )
        .to.emit(escrow, "OrderFunded")
        .withArgs(ORDER_ID, buyer.address, ethers.ZeroAddress, tradeAmount, 100);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(2); // FUNDED
      expect(order.fundedAt).to.be.gt(0);
    });

    it("should allow single-transaction createAndFundOrder", async function () {
      const singleTxId = 1002n;
      await expect(
        escrow.connect(buyer).createAndFundOrder(singleTxId, poParams, { value: tradeAmount })
      )
        .to.emit(escrow, "PurchaseOrderCreated")
        .and.to.emit(escrow, "OrderFunded");

      const order = await escrow.getOrder(singleTxId);
      expect(order.status).to.equal(2); // FUNDED
      expect(order.amount).to.equal(tradeAmount);
    });

    it("should allow supplier to submit compact evidence hash with metadata URI", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      const metadataUri = "ipfs://QmEvidenceBillOfLadingAndSGSAssayBundle";

      await expect(
        escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, metadataUri)
      )
        .to.emit(escrow, "EvidenceSubmitted")
        .withArgs(ORDER_ID, supplier.address, EVIDENCE_HASH, metadataUri);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(3); // EVIDENCE_SUBMITTED
      expect(order.evidenceHash).to.equal(EVIDENCE_HASH);
    });

    it("should process AI Oracle verification directly", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const score = 9600; // 96.00%
      const recommendation = 1; // RELEASE_FUNDS

      await expect(
        escrow.connect(aiOracle).submitAIVerification(ORDER_ID, score, recommendation, AI_REVIEW_HASH)
      )
        .to.emit(escrow, "AIVerified")
        .withArgs(ORDER_ID, score, recommendation, AI_REVIEW_HASH);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(4); // AI_VERIFIED
      expect(order.aiScore).to.equal(score);
      expect(order.aiRecommendation).to.equal(recommendation);
      expect(order.aiReviewHash).to.equal(AI_REVIEW_HASH);
    });

    it("should verify AI Oracle cryptographic ECDSA signature (submitAIVerificationWithSig)", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const score = 9800; // 98.00%
      const recommendation = 1; // RELEASE_FUNDS
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();

      // Encode message hash matching contract: abi.encodePacked(orderId, aiScore, uint8(recommendation), aiReviewHash, block.chainid, address(this))
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "uint16", "uint8", "bytes32", "uint256", "address"],
        [ORDER_ID, score, recommendation, AI_REVIEW_HASH, chainId, escrowAddress]
      );

      const signature = await aiOracle.signMessage(ethers.getBytes(messageHash));

      // Relayed by any party (e.g. buyer or relayer)
      await expect(
        escrow.connect(buyer).submitAIVerificationWithSig(
          ORDER_ID,
          score,
          recommendation,
          AI_REVIEW_HASH,
          signature
        )
      )
        .to.emit(escrow, "AIVerified")
        .withArgs(ORDER_ID, score, recommendation, AI_REVIEW_HASH);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(4); // AI_VERIFIED
      expect(order.aiScore).to.equal(score);
    });

    it("should reject tampered AI signature with custom error InvalidOracleSignature", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const score = 9800;
      const recommendation = 1;
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();

      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "uint16", "uint8", "bytes32", "uint256", "address"],
        [ORDER_ID, score, recommendation, AI_REVIEW_HASH, chainId, escrowAddress]
      );

      // Sign with attacker instead of authorized AI Oracle
      const invalidSignature = await attacker.signMessage(ethers.getBytes(messageHash));

      await expect(
        escrow.connect(buyer).submitAIVerificationWithSig(
          ORDER_ID,
          score,
          recommendation,
          AI_REVIEW_HASH,
          invalidSignature
        )
      ).to.be.revertedWithCustomError(escrow, "InvalidOracleSignature");
    });

    it("should release funds in 1 transaction via buyer approval with EIP-712 AI attestation (approveAndReleaseWithAttestation)", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();

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

      const nonce = 123456789n;
      const latestBlock = await ethers.provider.getBlock("latest");
      const attestationDeadline = latestBlock.timestamp + 86400 * 3;

      const attestation = {
        orderId: ORDER_ID,
        evidenceHash: EVIDENCE_HASH,
        reviewHash: AI_REVIEW_HASH,
        score: 98,
        recommendation: 1, // RELEASE_FUNDS
        nonce: nonce,
        deadline: attestationDeadline,
      };

      const signature = await aiOracle.signTypedData(domain, types, attestation);

      const feeBps = 100n; // 1.0%
      const expectedFee = (tradeAmount * feeBps) / 10000n; // 0.1 BOT
      const expectedNet = tradeAmount - expectedFee; // 9.9 BOT

      const initialSupplierBalance = await ethers.provider.getBalance(supplier.address);
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      // 1 single buyer transaction approves AI review and releases funds
      await expect(
        escrow.connect(buyer).approveAndReleaseWithAttestation(
          ORDER_ID,
          attestation,
          signature
        )
      )
        .to.emit(escrow, "AIVerified")
        .withArgs(ORDER_ID, 98, 1, AI_REVIEW_HASH)
        .and.to.emit(escrow, "FundsReleased")
        .withArgs(ORDER_ID, buyer.address, supplier.address, expectedNet, expectedFee);

      const finalSupplierBalance = await ethers.provider.getBalance(supplier.address);
      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      expect(finalSupplierBalance - initialSupplierBalance).to.equal(expectedNet);
      expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(expectedFee);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(5); // RELEASED
      expect(order.aiScore).to.equal(98);
      expect(await escrow.usedNonces(nonce)).to.equal(true);
    });

    it("should reject reused nonce on approveAndReleaseWithAttestation with NonceAlreadyUsed", async function () {
      const orderId1 = 1001n;
      const orderId2 = 1002n;
      await escrow.connect(buyer).createAndFundOrder(orderId1, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(orderId1, EVIDENCE_HASH, "ipfs://QmEvidenceBundle1");

      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();
      const domain = { name: "TradeLockEscrow", version: "1", chainId: Number(chainId), verifyingContract: escrowAddress };
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

      const nonce = 555555n;
      const latestBlock = await ethers.provider.getBlock("latest");
      const attestationDeadline = latestBlock.timestamp + 86400 * 3;

      const attestation1 = {
        orderId: orderId1,
        evidenceHash: EVIDENCE_HASH,
        reviewHash: AI_REVIEW_HASH,
        score: 98,
        recommendation: 1,
        nonce,
        deadline: attestationDeadline,
      };
      const signature1 = await aiOracle.signTypedData(domain, types, attestation1);

      // First release succeeds
      await escrow.connect(buyer).approveAndReleaseWithAttestation(orderId1, attestation1, signature1);

      // Create second order
      await escrow.connect(buyer).createAndFundOrder(orderId2, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(orderId2, EVIDENCE_HASH, "ipfs://QmEvidenceBundle2");

      const attestation2WithSameNonce = {
        orderId: orderId2,
        evidenceHash: EVIDENCE_HASH,
        reviewHash: AI_REVIEW_HASH,
        score: 98,
        recommendation: 1,
        nonce, // Reused nonce
        deadline: attestationDeadline,
      };
      const signature2 = await aiOracle.signTypedData(domain, types, attestation2WithSameNonce);

      await expect(
        escrow.connect(buyer).approveAndReleaseWithAttestation(
          orderId2,
          attestation2WithSameNonce,
          signature2
        )
      ).to.be.revertedWithCustomError(escrow, "NonceAlreadyUsed");
    });

    it("should reject attestation with mismatched evidenceHash with EvidenceMismatch", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();
      const domain = { name: "TradeLockEscrow", version: "1", chainId: Number(chainId), verifyingContract: escrowAddress };
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

      const latestBlock = await ethers.provider.getBlock("latest");
      const fakeEvidenceHash = ethers.keccak256(ethers.toUtf8Bytes("TAMPERED_EVIDENCE_FORGERY"));

      const attestation = {
        orderId: ORDER_ID,
        evidenceHash: fakeEvidenceHash, // Mismatched!
        reviewHash: AI_REVIEW_HASH,
        score: 98,
        recommendation: 1,
        nonce: 777777n,
        deadline: latestBlock.timestamp + 86400 * 3,
      };
      const signature = await aiOracle.signTypedData(domain, types, attestation);

      await expect(
        escrow.connect(buyer).approveAndReleaseWithAttestation(
          ORDER_ID,
          attestation,
          signature
        )
      ).to.be.revertedWithCustomError(escrow, "EvidenceMismatch");
    });

    it("should reject attestation if recommendation is not RELEASE_FUNDS", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();
      const domain = { name: "TradeLockEscrow", version: "1", chainId: Number(chainId), verifyingContract: escrowAddress };
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

      const latestBlock = await ethers.provider.getBlock("latest");

      const attestation = {
        orderId: ORDER_ID,
        evidenceHash: EVIDENCE_HASH,
        reviewHash: AI_REVIEW_HASH,
        score: 65,
        recommendation: 2, // REQUEST_REVIEW (not RELEASE_FUNDS)
        nonce: 888888n,
        deadline: latestBlock.timestamp + 86400 * 3,
      };
      const signature = await aiOracle.signTypedData(domain, types, attestation);

      await expect(
        escrow.connect(buyer).approveAndReleaseWithAttestation(
          ORDER_ID,
          attestation,
          signature
        )
      ).to.be.revertedWithCustomError(escrow, "AIRecommendationNotRelease");
    });

    it("should reject expired attestation with AttestationExpired", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();
      const domain = { name: "TradeLockEscrow", version: "1", chainId: Number(chainId), verifyingContract: escrowAddress };
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

      const latestBlock = await ethers.provider.getBlock("latest");

      const attestation = {
        orderId: ORDER_ID,
        evidenceHash: EVIDENCE_HASH,
        reviewHash: AI_REVIEW_HASH,
        score: 98,
        recommendation: 1,
        nonce: 999999n,
        deadline: latestBlock.timestamp - 10, // Expired!
      };
      const signature = await aiOracle.signTypedData(domain, types, attestation);

      await expect(
        escrow.connect(buyer).approveAndReleaseWithAttestation(
          ORDER_ID,
          attestation,
          signature
        )
      ).to.be.revertedWithCustomError(escrow, "AttestationExpired");
    });

    it("should reject non-buyer attempting to approve and release", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");

      const chainId = (await ethers.provider.getNetwork()).chainId;
      const escrowAddress = await escrow.getAddress();
      const domain = { name: "TradeLockEscrow", version: "1", chainId: Number(chainId), verifyingContract: escrowAddress };
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

      const latestBlock = await ethers.provider.getBlock("latest");

      const attestation = {
        orderId: ORDER_ID,
        evidenceHash: EVIDENCE_HASH,
        reviewHash: AI_REVIEW_HASH,
        score: 98,
        recommendation: 1,
        nonce: 1010101n,
        deadline: latestBlock.timestamp + 86400 * 3,
      };
      const signature = await aiOracle.signTypedData(domain, types, attestation);

      await expect(
        escrow.connect(attacker).approveAndReleaseWithAttestation(
          ORDER_ID,
          attestation,
          signature
        )
      ).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("should release funds upon buyer authorization with exact fee accounting", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
      await escrow.connect(supplier).submitEvidence(ORDER_ID, EVIDENCE_HASH, "ipfs://QmEvidenceBundle");
      await escrow.connect(aiOracle).submitAIVerification(ORDER_ID, 9800, 1, AI_REVIEW_HASH);

      const feeBps = 100n; // 1.0%
      const expectedFee = (tradeAmount * feeBps) / 10000n; // 0.1 BOT
      const expectedNet = tradeAmount - expectedFee; // 9.9 BOT

      const initialSupplierBalance = await ethers.provider.getBalance(supplier.address);
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      await expect(
        escrow.connect(buyer).releaseFunds(ORDER_ID)
      )
        .to.emit(escrow, "FundsReleased")
        .withArgs(ORDER_ID, buyer.address, supplier.address, expectedNet, expectedFee);

      const finalSupplierBalance = await ethers.provider.getBalance(supplier.address);
      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);

      expect(finalSupplierBalance - initialSupplierBalance).to.equal(expectedNet);
      expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(expectedFee);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(5); // RELEASED
    });

    it("should allow buyer refund if delivery deadline expired", async function () {
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });

      // Fast forward time past delivery deadline
      await ethers.provider.send("evm_increaseTime", [86400 * 8]); // 8 days
      await ethers.provider.send("evm_mine");

      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await escrow.connect(buyer).refundBuyer(ORDER_ID);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      expect(finalBuyerBalance + gasUsed - initialBuyerBalance).to.equal(tradeAmount);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(6); // REFUNDED
    });
  });

  describe("Dispute Management & Settlement", function () {
    const tradeAmount = ethers.parseEther("10.0");
    const DISPUTE_REASON_HASH = ethers.keccak256(ethers.toUtf8Bytes("CARGO_CONTAINER_SEAL_MISMATCH_DISPUTE"));

    let poParams;
    beforeEach(async function () {
      const block = await ethers.provider.getBlock("latest");
      poParams = {
        supplier: supplier.address,
        token: ethers.ZeroAddress,
        amount: tradeAmount,
        deliveryDeadline: block.timestamp + 86400 * 7,
        productCategory: 1,
        expectedQuantity: 10000n,
        quantityUnit: 1,
        destination: DESTINATION,
        orderRef: ORDER_REF,
        evidenceRequirementsHash: PO_REQUIREMENTS_HASH,
      };
      await escrow.connect(buyer).createAndFundOrder(ORDER_ID, poParams, { value: tradeAmount });
    });

    it("should allow buyer or supplier to dispute an order", async function () {
      await expect(
        escrow.connect(buyer).disputeOrder(ORDER_ID, DISPUTE_REASON_HASH)
      )
        .to.emit(escrow, "OrderDisputed")
        .withArgs(ORDER_ID, buyer.address, DISPUTE_REASON_HASH);

      const order = await escrow.getOrder(ORDER_ID);
      expect(order.status).to.equal(7); // DISPUTED
    });

    it("should allow arbiter/owner to resolve dispute with partial split", async function () {
      await escrow.connect(buyer).disputeOrder(ORDER_ID, DISPUTE_REASON_HASH);

      const buyerShareBps = 6000; // 60% to buyer, 40% to supplier
      const feeAmount = (tradeAmount * 100n) / 10000n; // 1.0% fee = 0.1 BOT
      const netTotal = tradeAmount - feeAmount; // 9.9 BOT
      const expectedBuyerPayout = (netTotal * 6000n) / 10000n; // 5.94 BOT
      const expectedSupplierPayout = netTotal - expectedBuyerPayout; // 3.96 BOT

      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
      const initialSupplierBalance = await ethers.provider.getBalance(supplier.address);

      await expect(
        escrow.connect(owner).resolveDispute(ORDER_ID, buyerShareBps)
      )
        .to.emit(escrow, "DisputeResolved")
        .withArgs(ORDER_ID, expectedBuyerPayout, expectedSupplierPayout, feeAmount);

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      const finalSupplierBalance = await ethers.provider.getBalance(supplier.address);

      expect(finalBuyerBalance - initialBuyerBalance).to.equal(expectedBuyerPayout);
      expect(finalSupplierBalance - initialSupplierBalance).to.equal(expectedSupplierPayout);
    });
  });

  describe("ERC-20 Token Escrow Flow", function () {
    const ERC20_ORDER_ID = 2001n;
    const tokenAmount = ethers.parseUnits("18000", 6); // 18,000 USDC

    let poParams;
    beforeEach(async function () {
      const block = await ethers.provider.getBlock("latest");
      const escrowAddress = await escrow.getAddress();

      poParams = {
        supplier: supplier.address,
        token: await mockToken.getAddress(),
        amount: tokenAmount,
        deliveryDeadline: block.timestamp + 86400 * 7,
        productCategory: 1,
        expectedQuantity: 10000n,
        quantityUnit: 1,
        destination: DESTINATION,
        orderRef: ORDER_REF,
        evidenceRequirementsHash: PO_REQUIREMENTS_HASH,
      };

      await mockToken.connect(buyer).approve(escrowAddress, tokenAmount);
    });

    it("should create and fund order using ERC-20 token", async function () {
      await expect(
        escrow.connect(buyer).createAndFundOrder(ERC20_ORDER_ID, poParams)
      )
        .to.emit(escrow, "PurchaseOrderCreated")
        .and.to.emit(escrow, "OrderFunded");

      const escrowBalance = await mockToken.balanceOf(await escrow.getAddress());
      expect(escrowBalance).to.equal(tokenAmount);
    });

    it("should release ERC-20 funds with fee to treasury and net to supplier", async function () {
      await escrow.connect(buyer).createAndFundOrder(ERC20_ORDER_ID, poParams);

      const feeAmount = (tokenAmount * 100n) / 10000n; // 180 USDC
      const netAmount = tokenAmount - feeAmount; // 17,820 USDC

      await expect(
        escrow.connect(buyer).releaseFunds(ERC20_ORDER_ID)
      )
        .to.emit(escrow, "FundsReleased")
        .withArgs(ERC20_ORDER_ID, buyer.address, supplier.address, netAmount, feeAmount);

      expect(await mockToken.balanceOf(supplier.address)).to.equal(netAmount);
      expect(await mockToken.balanceOf(treasury.address)).to.equal(feeAmount);
    });
  });
});

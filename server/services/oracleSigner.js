const { ethers } = require("ethers");

/**
 * AI Oracle EIP-712 Attestation Signer for BOT Chain Mainnet (Chain ID 677) & EVM Escrow Protocols
 */
class OracleSigner {
  constructor(privateKey) {
    // Fallback key for demo/local environment; override with ORACLE_PRIVATE_KEY in .env
    const key = privateKey || process.env.ORACLE_PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    this.wallet = new ethers.Wallet(key);
  }

  getOracleAddress() {
    return this.wallet.address;
  }

  /**
   * Signs the AI verification result using EIP-712 typed structured data.
   * Matches Solidity:
   * struct AIAttestation {
   *     uint256 orderId;
   *     bytes32 evidenceHash;
   *     bytes32 reviewHash;
   *     uint16 score;
   *     uint8 recommendation;
   *     uint256 nonce;
   *     uint256 deadline;
   * }
   */
  async signAttestation({
    orderId,
    evidenceHash,
    reviewHash,
    score,
    recommendationCode,
    chainId = 677,
    contractAddress = "0x7c87c29d5bb020de0faf3eb2b2b11c1a2fa07b88",
    nonce = null,
    deadline = null,
  }) {
    const formattedOrderId = typeof orderId === "string" && orderId.startsWith("0x")
      ? BigInt(orderId)
      : BigInt(orderId || 0);

    const attestationNonce = nonce !== null ? BigInt(nonce) : BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000));
    const attestationDeadline = deadline !== null ? BigInt(deadline) : BigInt(Math.floor(Date.now() / 1000) + 86400 * 3); // 3 days validity

    const formattedEvidenceHash = evidenceHash && evidenceHash.startsWith("0x") && evidenceHash.length === 66
      ? evidenceHash
      : ethers.keccak256(ethers.toUtf8Bytes(evidenceHash || "EMPTY_EVIDENCE"));

    const formattedReviewHash = reviewHash && reviewHash.startsWith("0x") && reviewHash.length === 66
      ? reviewHash
      : ethers.keccak256(ethers.toUtf8Bytes(reviewHash || "EMPTY_REVIEW"));

    // Normalize checksum address
    const checksumVerifyingContract = ethers.getAddress(contractAddress.toLowerCase());

    const domain = {
      name: "TradeLockEscrow",
      version: "1",
      chainId: Number(chainId),
      verifyingContract: checksumVerifyingContract,
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

    const value = {
      orderId: formattedOrderId,
      evidenceHash: formattedEvidenceHash,
      reviewHash: formattedReviewHash,
      score: Number(score),
      recommendation: Number(recommendationCode),
      nonce: attestationNonce,
      deadline: attestationDeadline,
    };

    const signature = await this.wallet.signTypedData(domain, types, value);

    // Legacy EIP-191 message hash for backward compatibility
    const legacyMessageHash = ethers.solidityPackedKeccak256(
      ["uint256", "uint16", "uint8", "bytes32", "uint256", "address"],
      [
        formattedOrderId,
        score,
        recommendationCode,
        formattedReviewHash,
        chainId,
        checksumVerifyingContract
      ]
    );
    const legacySignature = await this.wallet.signMessage(ethers.getBytes(legacyMessageHash));

    return {
      signer: this.wallet.address,
      domain,
      types,
      attestation: {
        orderId: formattedOrderId.toString(),
        evidenceHash: formattedEvidenceHash,
        reviewHash: formattedReviewHash,
        score: Number(score),
        recommendation: Number(recommendationCode),
        nonce: attestationNonce.toString(),
        deadline: attestationDeadline.toString(),
      },
      signature,
      messageHash: legacyMessageHash,
      legacyMessageHash,
      legacySignature,
    };
  }

  /**
   * Helper matching legacy signVerification signature
   */
  async signVerification(orderId, score, recommendationCode, reportHash, chainId = 677, contractAddress = "0x7c87c29d5bb020de0faf3eb2b2b11c1a2fa07b88") {
    return this.signAttestation({
      orderId,
      evidenceHash: ethers.keccak256(ethers.toUtf8Bytes("DEFAULT_EVIDENCE")),
      reviewHash: reportHash,
      score,
      recommendationCode,
      chainId,
      contractAddress,
    });
  }
}

module.exports = OracleSigner;

const { ethers } = require("ethers");

/**
 * AI Output Schema Validator & Error Corrector
 * Section 19: Forces AI output into a strict schema, validates server-side,
 * retries on error, and falls back to REVIEW_REQUIRED if invalid.
 */
class SchemaValidator {
  /**
   * Validates AI response against TradeLock structured schema.
   * @param {Object} data - Raw or parsed AI output
   * @returns {{ valid: boolean, errors: string[], sanitized: Object|null }}
   */
  static validate(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["AI output is not a valid JSON object"], sanitized: null };
    }

    // 1. Validate overallScore (0 - 100)
    let overallScore = Number(data.overallScore);
    if (isNaN(overallScore) || overallScore < 0 || overallScore > 100) {
      errors.push(`Invalid overallScore: must be an integer between 0 and 100 (got ${data.overallScore})`);
    } else {
      overallScore = Math.round(overallScore);
    }

    // 2. Validate recommendation
    const validRecommendations = ["RELEASE_FUNDS", "REQUEST_REVIEW", "FLAG_DISPUTE"];
    let recommendation = data.recommendation;
    if (!validRecommendations.includes(recommendation)) {
      errors.push(`Invalid recommendation: must be one of ${validRecommendations.join(", ")} (got ${recommendation})`);
    }

    // 3. Validate recommendationCode (1, 2, 3)
    let recommendationCode = Number(data.recommendationCode);
    const expectedCodeMap = { RELEASE_FUNDS: 1, REQUEST_REVIEW: 2, FLAG_DISPUTE: 3 };
    if (![1, 2, 3].includes(recommendationCode)) {
      recommendationCode = expectedCodeMap[recommendation] || 2;
    }

    // 4. Validate confidence (0 - 100)
    let confidence = Number(data.confidence || overallScore);
    if (isNaN(confidence) || confidence < 0 || confidence > 100) {
      errors.push(`Invalid confidence score: must be between 0 and 100 (got ${data.confidence})`);
    }

    // 5. Validate quantityEvaluation
    const quantityEvaluation = data.quantityEvaluation || {};
    if (!quantityEvaluation.result || !["MATCH", "PARTIAL_MATCH", "MISMATCH", "NOT_VERIFIABLE"].includes(quantityEvaluation.result)) {
      errors.push("quantityEvaluation.result must be MATCH, PARTIAL_MATCH, MISMATCH, or NOT_VERIFIABLE");
    }

    // 6. Validate dateEvaluation
    const dateEvaluation = data.dateEvaluation || {};
    if (!dateEvaluation.result || !["MATCH", "LATE", "MISMATCH", "NOT_VERIFIABLE"].includes(dateEvaluation.result)) {
      errors.push("dateEvaluation.result must be MATCH, LATE, MISMATCH, or NOT_VERIFIABLE");
    }

    // 7. Validate documentConsistency
    const documentConsistency = data.documentConsistency || {};
    if (!documentConsistency.status || !["MATCH", "PARTIAL_MATCH", "MISMATCH", "NOT_VERIFIABLE"].includes(documentConsistency.status)) {
      errors.push("documentConsistency.status must be MATCH, PARTIAL_MATCH, MISMATCH, or NOT_VERIFIABLE");
    }

    // 8. Validate anomalies array
    const anomalies = Array.isArray(data.anomalies) ? data.anomalies : [];

    // 9. Validate summary
    const summary = typeof data.summary === "string" && data.summary.trim().length > 0
      ? data.summary
      : "Automated AI verification report completed.";

    if (errors.length > 0) {
      return { valid: false, errors, sanitized: null };
    }

    const sanitized = {
      overallScore,
      recommendation,
      recommendationCode,
      confidence,
      quantityEvaluation,
      dateEvaluation,
      documentConsistency,
      conditionAssessment: data.conditionAssessment || { status: "NOT_VERIFIABLE", details: "Standard checks" },
      imageEvaluation: data.imageEvaluation || { hasImageEvidence: false, status: "NOT_VERIFIABLE" },
      anomalies,
      summary,
      epistemicBreakdown: data.epistemicBreakdown || {
        verifiedCount: 4,
        unverifiedCount: 0,
        claims: [],
      },
      vectors: data.vectors || {
        vector1_quantity: quantityEvaluation.result || "MATCH",
        vector2_dates: dateEvaluation.result || "MATCH",
        vector3_documents: documentConsistency.status || "MATCH",
        vector4_quality: data.conditionAssessment?.status || "PASS",
        vector5_tamperScan: anomalies.length === 0 ? "PASS" : "ANOMALIES_DETECTED",
      },
    };

    return { valid: true, errors: [], sanitized };
  }

  /**
   * Generates a safe fallback AI review with REVIEW_REQUIRED (code 2)
   * Section 19: Never automatically release funds on invalid AI output
   */
  static createFallbackReview(order, evidence, reason = "AI provider schema validation failure") {
    const evidenceHash = evidence
      ? ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(evidence)))
      : ethers.keccak256(ethers.toUtf8Bytes("EMPTY_EVIDENCE"));

    const rawPayload = {
      orderId: order.id,
      overallScore: 65,
      recommendation: "REQUEST_REVIEW",
      recommendationCode: 2, // 2 = REQUEST_REVIEW (Mandatory Buyer Review)
      confidence: 65.0,
      quantityEvaluation: {
        result: "NOT_VERIFIABLE",
        expected: `${order.expectedQuantity} ${order.quantityUnit || "Metric Tons"}`,
        evidence: "Unconfirmed by AI parser",
        status: "NOT_VERIFIABLE",
      },
      dateEvaluation: {
        result: "NOT_VERIFIABLE",
        requiredDelivery: order.deliveryDeadline || "Unknown",
        evidenceDate: "Unconfirmed",
        status: "NOT_VERIFIABLE",
      },
      documentConsistency: {
        status: "NOT_VERIFIABLE",
        details: "Automated parsing inconclusive; requires manual inspection",
      },
      conditionAssessment: {
        status: "NOT_VERIFIABLE",
        details: "Specs require manual buyer signoff",
      },
      imageEvaluation: {
        hasImageEvidence: false,
        status: "NOT_VERIFIABLE",
      },
      anomalies: [
        `AI Schema Recovery Fallback: ${reason}`,
        "Automated fund release disabled. Manual buyer inspection required before release.",
      ],
      summary: `AI verification encountered parsing irregularities (${reason}). Status set to REQUEST_REVIEW. Buyer must manually inspect evidence before releasing funds.`,
      epistemicBreakdown: {
        verifiedCount: 0,
        unverifiedCount: 5,
        claims: [
          { claim: "Quantity", status: "NOT_VERIFIABLE" },
          { claim: "Dates", status: "NOT_VERIFIABLE" },
          { claim: "Documents", status: "NOT_VERIFIABLE" },
          { claim: "Quality", status: "NOT_VERIFIABLE" },
          { claim: "Seals", status: "NOT_VERIFIABLE" },
        ],
      },
      reviewedAt: new Date().toISOString(),
      validationStatus: "FALLBACK_REVIEW_REQUIRED",
    };

    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(rawPayload)));

    return {
      ...rawPayload,
      evidenceHash,
      reviewHash,
    };
  }
}

module.exports = SchemaValidator;

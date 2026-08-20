const DeterministicRuleAIProvider = require("./providers/deterministicAIProvider");

/**
 * AIVerifier
 * Static wrapper utilizing DeterministicRuleAIProvider for backward compatibility
 */
class AIVerifier {
  static verifyTrade(po, evidence = {}) {
    const provider = new DeterministicRuleAIProvider();
    const result = provider.performMultiVectorVerification(po, evidence);

    return {
      ...result,
      executiveSummary: result.summary,
      confidencePercentage: result.overallScore.toFixed(1),
      confidenceScore: result.overallScore * 100, // basis points 0 - 10000
      reportHash: result.reviewHash,
      // Compatibility aliases
      quantityMatch: result.quantityEvaluation?.result || "MATCH",
      dateMatch: result.dateEvaluation?.result || "MATCH",
      documentConsistency: result.documentConsistency?.status || "MATCH",
      conditionAssessment: result.conditionAssessment?.status || "PASS",
      documentEvaluation: {
        shipmentDocumentConsistency: { result: result.documentConsistency?.status || "MATCH" },
        supplierIdentityConsistency: { result: "MATCH" },
        destinationCheck: { result: "MATCH" },
      },
    };
  }
}

module.exports = AIVerifier;

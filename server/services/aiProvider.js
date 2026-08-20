/**
 * AIProvider Abstract Base Interface
 * Section 19: Real Provider Abstraction
 */
class AIProvider {
  constructor(name) {
    if (new.target === AIProvider) {
      throw new TypeError("Cannot construct AIProvider abstract class directly");
    }
    this.name = name || "GenericAIProvider";
  }

  /**
   * Main verification interface.
   * @param {Object} order - Purchase order details
   * @param {Object} evidence - Shipping documents, lab certificates, photos, seals
   * @returns {Promise<Object>} Structured AI Verification Output
   */
  async analyzeEvidence(order, evidence) {
    throw new Error("analyzeEvidence() must be implemented by subclass");
  }

  /**
   * Returns metadata about the AI provider
   */
  getProviderInfo() {
    return {
      name: this.name,
      supportsVision: false,
      supportsStructuredOutput: true,
    };
  }
}

module.exports = AIProvider;

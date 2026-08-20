const DeterministicRuleAIProvider = require("./providers/deterministicAIProvider");
const GeminiAIProvider = require("./providers/geminiAIProvider");

/**
 * AI Provider Factory
 * Section 19: Environment-configured AI Provider Abstraction
 */
class AIProviderFactory {
  /**
   * Resolves and instantiates the configured AI provider.
   * @param {string} providerName - Optional override name
   * @returns {AIProvider}
   */
  static getProvider(providerName = null) {
    const requested = (providerName || process.env.AI_PROVIDER || "AUTO").toUpperCase();

    if (requested === "GEMINI" || (requested === "AUTO" && process.env.GEMINI_API_KEY)) {
      return new GeminiAIProvider();
    }

    // Default to the deterministic 5-vector forensic engine
    return new DeterministicRuleAIProvider();
  }
}

module.exports = AIProviderFactory;

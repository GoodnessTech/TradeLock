const AIProvider = require("../aiProvider");
const SchemaValidator = require("../schemaValidator");
const DeterministicRuleAIProvider = require("./deterministicAIProvider");
const { ethers } = require("ethers");

/**
 * GeminiAIProvider
 * Live multi-modal LLM analyzer powered by Google Gemini API.
 * Features strict JSON schema enforcement, automatic retry on formatting errors,
 * and deterministic fallback.
 */
class GeminiAIProvider extends AIProvider {
  constructor(apiKey = null) {
    super("GeminiAIProvider");
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.fallbackProvider = new DeterministicRuleAIProvider();
  }

  async analyzeEvidence(order, evidence) {
    if (!this.apiKey) {
      console.log("[GeminiAIProvider] No GEMINI_API_KEY detected. Using deterministic forensic engine.");
      return this.fallbackProvider.analyzeEvidence(order, evidence);
    }

    try {
      // 1. First attempt with Gemini API
      const result = await this.callGeminiModel(order, evidence, null);
      const validation = SchemaValidator.validate(result);

      if (validation.valid) {
        return this.enrichWithHashes(validation.sanitized, evidence);
      }

      console.warn("[GeminiAIProvider] Initial output invalid, retrying with schema correction prompt...");

      // 2. Retry once with schema correction
      const retryResult = await this.callGeminiModel(order, evidence, validation.errors);
      const retryValidation = SchemaValidator.validate(retryResult);

      if (retryValidation.valid) {
        return this.enrichWithHashes(retryValidation.sanitized, evidence);
      }

      console.warn("[GeminiAIProvider] Retry output still invalid, returning safe REVIEW_REQUIRED fallback.");
      return SchemaValidator.createFallbackReview(order, evidence, "Gemini output failed schema verification after retry");
    } catch (err) {
      console.error("[GeminiAIProvider] API error:", err.message);
      // Seamlessly execute deterministic forensic engine if API is unreachable
      return this.fallbackProvider.analyzeEvidence(order, evidence);
    }
  }

  async callGeminiModel(order, evidence, previousErrors = null) {
    const prompt = this.buildPrompt(order, evidence, previousErrors);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }

    return JSON.parse(rawText);
  }

  buildPrompt(order, evidence, previousErrors) {
    return `
You are the TradeLock AI Oracle Verification Engine for international real-world asset trade escrows.
Analyze the following Purchase Order and Supplier Evidence bundle across 5 vectors:
1. Quantity & Weight Reconciliation
2. Shipping Timeline & Delivery Deadline
3. Manifest, Container & Customs Seal Consistency
4. Laboratory Quality Spec & Assay Grading
5. Forensic Tamper & Alteration Scan

PURCHASE ORDER:
${JSON.stringify(order, null, 2)}

SUPPLIER EVIDENCE:
${JSON.stringify(evidence, null, 2)}

${
  previousErrors
    ? `IMPORTANT: Your previous output failed schema validation with errors:\n${previousErrors.join("\n")}\nYou MUST correct these errors.`
    : ""
}

Respond ONLY with a valid JSON object matching EXACTLY this structure:
{
  "overallScore": <integer 0-100>,
  "recommendation": <"RELEASE_FUNDS" | "REQUEST_REVIEW" | "FLAG_DISPUTE">,
  "recommendationCode": <1 for RELEASE_FUNDS, 2 for REQUEST_REVIEW, 3 for FLAG_DISPUTE>,
  "confidence": <number 0-100>,
  "quantityEvaluation": {
    "result": <"MATCH" | "PARTIAL_MATCH" | "MISMATCH" | "NOT_VERIFIABLE">,
    "expected": "<string>",
    "evidence": "<string>",
    "status": "<string>"
  },
  "dateEvaluation": {
    "result": <"MATCH" | "LATE" | "MISMATCH" | "NOT_VERIFIABLE">,
    "requiredDelivery": "<string>",
    "evidenceDate": "<string>",
    "status": "<string>"
  },
  "documentConsistency": {
    "status": <"MATCH" | "PARTIAL_MATCH" | "MISMATCH" | "NOT_VERIFIABLE">,
    "details": "<string>"
  },
  "conditionAssessment": {
    "status": <"PASS" | "FAIL" | "NOT_VERIFIABLE">,
    "details": "<string>"
  },
  "imageEvaluation": {
    "hasImageEvidence": <boolean>,
    "status": "<string>"
  },
  "anomalies": ["<string>", ...],
  "summary": "<string>",
  "epistemicBreakdown": {
    "verifiedCount": <integer>,
    "unverifiedCount": <integer>,
    "claims": [
      { "claim": "<string>", "status": "<VERIFIED_FROM_EVIDENCE | NOT_VERIFIABLE>" }
    ]
  },
  "vectors": {
    "vector1_quantity": "<string>",
    "vector2_dates": "<string>",
    "vector3_documents": "<string>",
    "vector4_quality": "<string>",
    "vector5_tamperScan": "<string>"
  }
}
`;
  }

  enrichWithHashes(report, evidence) {
    const evidenceHash = evidence
      ? ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(evidence)))
      : ethers.keccak256(ethers.toUtf8Bytes("EMPTY_EVIDENCE"));

    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(report)));

    return {
      ...report,
      evidenceHash,
      reviewHash,
    };
  }
}

module.exports = GeminiAIProvider;

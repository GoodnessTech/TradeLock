-- ====================================================================
-- TradeLock Protocol Relational Database Schema
-- Target: BOT Chain Mainnet 677 Compliant Escrow Protocol
-- Section 18: Database Relational Schema
-- ====================================================================

-- 1. Users Table (Importers, Exporters, Protocol Admins, Arbitrators)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER', -- BUYER, SUPPLIER, ARBITRATOR, ADMIN
    organization VARCHAR(255),
    country VARCHAR(100),
    reputation_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Orders Table (Purchase Orders & Escrow Records)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(66) PRIMARY KEY, -- 0x-prefixed 32-byte hex ID
    raw_id VARCHAR(100) UNIQUE NOT NULL, -- e.g. COCOA-2408
    title VARCHAR(255) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Agricultural Commodities',
    amount DECIMAL(36, 18) NOT NULL, -- Numeric escrow amount
    currency VARCHAR(16) NOT NULL DEFAULT 'BOT',
    token_address VARCHAR(42) NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    expected_quantity DECIMAL(24, 6) NOT NULL,
    quantity_unit VARCHAR(32) NOT NULL DEFAULT 'Metric Tons',
    buyer_id VARCHAR(64),
    buyer_address VARCHAR(42) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    supplier_id VARCHAR(64),
    supplier_address VARCHAR(42) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    origin_port VARCHAR(100) NOT NULL,
    destination_port VARCHAR(100) NOT NULL,
    incoterm VARCHAR(32) NOT NULL DEFAULT 'CIF',
    delivery_deadline TIMESTAMP NOT NULL,
    quality_parameters_json TEXT, -- JSON blob of required specs (moisture, grade, purity)
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED', -- CREATED, FUNDED, EVIDENCE_SUBMITTED, AI_VERIFIED, RELEASED, REFUNDED, DISPUTED
    fee_bps INT NOT NULL DEFAULT 100, -- 100 = 1.00%
    is_demo BOOLEAN NOT NULL DEFAULT 0, -- Explicit Demo Mode tag
    contract_address VARCHAR(42),
    chain_id INT NOT NULL DEFAULT 677,
    creation_tx_hash VARCHAR(66),
    funding_tx_hash VARCHAR(66),
    release_tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (supplier_id) REFERENCES users(id)
);

-- 3. Evidence Table (Shipping & Inspection Multi-Modal Manifests)
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(66) NOT NULL,
    evidence_hash VARCHAR(66) NOT NULL, -- keccak256 hash of entire evidence payload
    ipfs_uri VARCHAR(255),
    bill_of_lading_json TEXT,
    commercial_invoice_json TEXT,
    packing_list_json TEXT,
    inspection_certificate_json TEXT,
    customs_seals_json TEXT,
    vessel_tracking_json TEXT,
    photo_urls_json TEXT,
    tamper_detected BOOLEAN DEFAULT 0,
    is_demo_evidence BOOLEAN DEFAULT 0,
    submitted_by VARCHAR(42) NOT NULL,
    submission_tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 4. AI Reviews Table (Structured Multi-Vector Verification Outputs)
CREATE TABLE IF NOT EXISTS ai_reviews (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(66) NOT NULL,
    evidence_hash VARCHAR(66) NOT NULL,
    review_hash VARCHAR(66) NOT NULL, -- keccak256 hash of review payload
    overall_score INT NOT NULL, -- 0 to 100
    recommendation VARCHAR(32) NOT NULL, -- RELEASE_FUNDS, REQUEST_REVIEW, FLAG_DISPUTE
    recommendation_code INT NOT NULL, -- 1 = RELEASE_FUNDS, 2 = REQUEST_REVIEW, 3 = FLAG_DISPUTE
    confidence DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    quantity_match_status VARCHAR(32), -- MATCH, PARTIAL_MATCH, MISMATCH, NOT_VERIFIABLE
    date_match_status VARCHAR(32), -- MATCH, LATE, NOT_VERIFIABLE
    doc_consistency_status VARCHAR(32), -- MATCH, MISMATCH, NOT_VERIFIABLE
    condition_assessment_status VARCHAR(32), -- PASS, FAIL, NOT_VERIFIABLE
    anomalies_json TEXT, -- JSON array of detected anomalies
    summary TEXT,
    epistemic_breakdown_json TEXT, -- Verified vs Unverified breakdown
    ai_provider VARCHAR(64) NOT NULL DEFAULT 'DeterministicRuleAIProvider',
    validation_status VARCHAR(32) NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 5. AI Attestations Table (Cryptographic EIP-712 / EIP-191 Signatures)
CREATE TABLE IF NOT EXISTS ai_attestations (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(66) NOT NULL,
    review_id VARCHAR(64) NOT NULL,
    evidence_hash VARCHAR(66) NOT NULL,
    review_hash VARCHAR(66) NOT NULL,
    score INT NOT NULL,
    recommendation_code INT NOT NULL,
    nonce VARCHAR(78) NOT NULL UNIQUE,
    deadline BIGINT NOT NULL,
    signature VARCHAR(132) NOT NULL,
    signer_address VARCHAR(42) NOT NULL,
    chain_id INT NOT NULL DEFAULT 677,
    verifying_contract VARCHAR(42) NOT NULL,
    legacy_message_hash VARCHAR(66),
    legacy_signature VARCHAR(132),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES ai_reviews(id) ON DELETE CASCADE
);

-- 6. Transactions Table (Onchain Transaction Records & Status)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(66) NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    tx_type VARCHAR(32) NOT NULL, -- CREATE_ORDER, FUND_ORDER, SUBMIT_EVIDENCE, APPROVE_RELEASE, DISPUTE, REFUND
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) DEFAULT 0,
    currency VARCHAR(16) DEFAULT 'BOT',
    chain_id INT NOT NULL DEFAULT 677,
    block_number BIGINT,
    gas_used BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED', -- PENDING, CONFIRMED, FAILED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 7. Disputes Table (Arbitration & Split Settlement Records)
CREATE TABLE IF NOT EXISTS disputes (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(66) NOT NULL,
    initiator_address VARCHAR(42) NOT NULL,
    reason_hash VARCHAR(66) NOT NULL,
    reason_description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- OPEN, RESOLVED, DISMISSED
    buyer_share_bps INT, -- Share allocated to buyer in basis points (e.g. 6000 = 60%)
    supplier_share_bps INT, -- Share allocated to supplier
    dispute_admin VARCHAR(42),
    resolution_tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_address);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_address);
CREATE INDEX IF NOT EXISTS idx_evidence_order ON evidence(order_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_order ON ai_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_ai_attestations_order ON ai_attestations(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);

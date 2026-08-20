// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title TradeLockEscrow
 * @notice AI-Powered Onchain Trade Escrow Protocol for International Buyers & Suppliers.
 * Target: BOT Chain Mainnet (Chain ID 677).
 *
 * Architecture Principles:
 * 1. Gas Efficient Onchain Data Model: Zero raw strings, photos, PDFs, or verbose text.
 *    Only compact bytes32 cryptographic hashes, enums, and packed uint types are stored.
 * 2. Mandatory Separation of Concerns: AI can only evaluate and recommend.
 *    Only the buyer can authorize fund release. Smart contract executes settlement.
 * 3. Cryptographic EIP-712 Attestation: AI decisions are cryptographically attested offchain
 *    and verified onchain in a single atomic release transaction.
 * 4. Enterprise Security Architecture: Ownable2Step, Pausable, ReentrancyGuard, SafeERC20,
 *    Replay Protection, Strict State Machine, and Strict Isolation of User Escrow Funds.
 */
contract TradeLockEscrow is ReentrancyGuard, Ownable2Step, Pausable, EIP712 {
    using SafeERC20 for IERC20;

    // --- Enums ---

    enum OrderStatus {
        NONE,
        CREATED,
        FUNDED,
        EVIDENCE_SUBMITTED,
        AI_VERIFIED,
        RELEASED,
        REFUNDED,
        DISPUTED
    }

    enum AIRecommendation {
        NONE,
        RELEASE_FUNDS,     // Code 1: High confidence, zero critical anomalies
        REQUEST_REVIEW,    // Code 2: Moderate variance, buyer review required
        FLAG_DISPUTE       // Code 3: Critical shortfall, seal mismatch, or forgery
    }

    // --- Packed Storage Structs ---

    /**
     * @notice Ultra-compact, storage-packed Purchase Order & Escrow record.
     * Tightly packed into 9 consecutive 32-byte storage slots (zero dynamic array overhead).
     */
    struct Order {
        // Slot 0 (32 bytes)
        address buyer;                  // 20 bytes
        OrderStatus status;             // 1 byte
        AIRecommendation aiRecommendation; // 1 byte
        uint16 feeBps;                  // 2 bytes (fee basis points, e.g. 100 = 1.0%)
        uint16 aiScore;                 // 2 bytes (AI confidence score 0 - 10000 bps)
        uint32 createdAt;               // 4 bytes (Unix timestamp)
        uint16 productCategory;         // 2 bytes (Standardized RWA commodity code)

        // Slot 1 (32 bytes)
        address supplier;               // 20 bytes
        uint32 deliveryDeadline;        // 4 bytes (Unix timestamp)
        uint32 fundedAt;                // 4 bytes (Unix timestamp)
        uint32 settledAt;               // 4 bytes (Unix timestamp)

        // Slot 2 (32 bytes)
        address token;                  // 20 bytes (address(0) for native BOT)
        uint64 expectedQuantity;        // 8 bytes (Fixed-point quantity)
        uint8 quantityUnit;             // 1 byte (Enum: 1=MT, 2=KG, 3=BBL, 4=LBS, 5=UNITS)
        uint24 __reserved;              // 3 bytes padding/reserved

        // Slot 3 (32 bytes)
        uint256 amount;                 // 32 bytes (Escrow balance in wei or token units)

        // Slot 4 (32 bytes)
        bytes32 destination;            // 32 bytes (Port / Delivery Destination hash or code)

        // Slot 5 (32 bytes)
        bytes32 orderRef;               // 32 bytes (Commercial invoice / PO reference hash)

        // Slot 6 (32 bytes)
        bytes32 evidenceRequirementsHash; // 32 bytes (Hash of required inspection / shipping criteria)

        // Slot 7 (32 bytes)
        bytes32 evidenceHash;           // 32 bytes (Cryptographic hash of supplier evidence bundle)

        // Slot 8 (32 bytes)
        bytes32 aiReviewHash;           // 32 bytes (Cryptographic hash of AI verification report)
    }

    /**
     * @notice Parameter bundle for Purchase Order creation to prevent stack-too-deep.
     */
    struct PurchaseOrderParams {
        address supplier;
        address token;
        uint256 amount;
        uint32 deliveryDeadline;
        uint16 productCategory;
        uint64 expectedQuantity;
        uint8 quantityUnit;
        bytes32 destination;
        bytes32 orderRef;
        bytes32 evidenceRequirementsHash;
    }

    /**
     * @notice Structured EIP-712 AI Attestation Payload.
     */
    struct AIAttestation {
        uint256 orderId;
        bytes32 evidenceHash;
        bytes32 reviewHash;
        uint16 score;
        uint8 recommendation;
        uint256 nonce;
        uint256 deadline;
    }

    // --- Protocol Constants & Configuration ---

    bytes32 public constant AI_ATTESTATION_TYPEHASH = keccak256(
        "AIAttestation(uint256 orderId,bytes32 evidenceHash,bytes32 reviewHash,uint16 score,uint8 recommendation,uint256 nonce,uint256 deadline)"
    );

    uint16 public constant MIN_FEE_BPS = 50;   // 0.50%
    uint16 public constant MAX_FEE_BPS = 200;  // 2.00%
    uint16 public constant BPS_DENOMINATOR = 10000;

    uint16 public feeBps = 100; // Default 1.00%
    address public treasury;
    address public aiOracle;
    address public disputeAdmin;

    // --- Storage ---

    mapping(uint256 => Order) public orders;
    mapping(uint256 => bool) public usedNonces;
    mapping(address => uint256) public totalEscrowed; // Active locked escrow liabilities per token (address(0) for native BOT)
    uint256[] public orderIds;

    // --- Custom Errors (Gas Optimized) ---

    error OrderAlreadyExists();
    error OrderNotFound();
    error OrderAlreadyReleased();
    error OrderAlreadySettled();
    error InvalidSupplier();
    error InvalidAmount();
    error InvalidDeadline();
    error EmptyRequirementsHash();
    error InvalidStatus();
    error Unauthorized();
    error IncorrectNativeAmount();
    error NativeTokenNotAccepted();
    error NativeTransferFailed();
    error EmptyEvidenceHash();
    error ScoreOutOfBounds();
    error InvalidOracleSignature();
    error RefundNotEligible();
    error InvalidShareBps();
    error FeeOutOfBounds();
    error ZeroAddress();
    error EvidenceMismatch();
    error AIRecommendationNotRelease();
    error AttestationExpired();
    error NonceAlreadyUsed();
    error InsufficientRescuableBalance();

    // --- Events (Optimized for Frontend & Subgraph Indexing) ---

    event PurchaseOrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed supplier,
        address token,
        uint256 amount,
        uint32 deliveryDeadline,
        uint16 productCategory,
        uint64 expectedQuantity,
        uint8 quantityUnit,
        bytes32 destination,
        bytes32 orderRef,
        bytes32 evidenceRequirementsHash
    );

    event PurchaseOrderFunded(
        uint256 indexed orderId,
        address indexed buyer,
        address token,
        uint256 amount,
        uint16 feeBps
    );

    event OrderFunded(
        uint256 indexed orderId,
        address indexed buyer,
        address token,
        uint256 amount,
        uint16 feeBps
    );

    event EvidenceSubmitted(
        uint256 indexed orderId,
        address indexed supplier,
        bytes32 evidenceHash,
        string metadataUri
    );

    event AIVerified(
        uint256 indexed orderId,
        uint16 aiScore,
        AIRecommendation recommendation,
        bytes32 aiReviewHash
    );

    event FundsReleased(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed supplier,
        uint256 netAmount,
        uint256 feeAmount
    );

    event OrderRefunded(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 refundAmount
    );

    event OrderDisputed(
        uint256 indexed orderId,
        address indexed initiator,
        bytes32 reasonHash
    );

    event DisputeResolved(
        uint256 indexed orderId,
        uint256 buyerAmount,
        uint256 supplierAmount,
        uint256 feeAmount
    );

    event FeeUpdated(uint16 newFeeBps);
    event TreasuryUpdated(address indexed newTreasury);
    event AIOracleUpdated(address indexed newAiOracle);
    event DisputeAdminUpdated(address indexed newDisputeAdmin);
    event TokensRescued(address indexed token, address indexed to, uint256 amount);

    constructor(
        address _treasury,
        address _aiOracle
    ) Ownable(msg.sender) EIP712("TradeLockEscrow", "1") {
        if (_treasury == address(0) || _aiOracle == address(0)) revert ZeroAddress();
        treasury = _treasury;
        aiOracle = _aiOracle;
        disputeAdmin = msg.sender;
    }

    // --- Purchase Order & Escrow Lifecycle ---

    /**
     * @notice Creates a new Purchase Order escrow entry.
     * @param orderId Unique numeric identifier or keccak256 integer.
     * @param params Compact purchase order parameter struct.
     */
    function createPurchaseOrder(
        uint256 orderId,
        PurchaseOrderParams calldata params
    ) external whenNotPaused {
        if (orders[orderId].status != OrderStatus.NONE) revert OrderAlreadyExists();
        if (params.supplier == address(0) || params.supplier == msg.sender) revert InvalidSupplier();
        if (params.amount == 0) revert InvalidAmount();
        if (params.deliveryDeadline <= block.timestamp) revert InvalidDeadline();
        if (params.evidenceRequirementsHash == bytes32(0)) revert EmptyRequirementsHash();

        orders[orderId] = Order({
            buyer: msg.sender,
            status: OrderStatus.CREATED,
            aiRecommendation: AIRecommendation.NONE,
            feeBps: feeBps,
            aiScore: 0,
            createdAt: uint32(block.timestamp),
            productCategory: params.productCategory,
            supplier: params.supplier,
            deliveryDeadline: params.deliveryDeadline,
            fundedAt: 0,
            settledAt: 0,
            token: params.token,
            expectedQuantity: params.expectedQuantity,
            quantityUnit: params.quantityUnit,
            __reserved: 0,
            amount: params.amount,
            destination: params.destination,
            orderRef: params.orderRef,
            evidenceRequirementsHash: params.evidenceRequirementsHash,
            evidenceHash: bytes32(0),
            aiReviewHash: bytes32(0)
        });

        orderIds.push(orderId);

        emit PurchaseOrderCreated(
            orderId,
            msg.sender,
            params.supplier,
            params.token,
            params.amount,
            params.deliveryDeadline,
            params.productCategory,
            params.expectedQuantity,
            params.quantityUnit,
            params.destination,
            params.orderRef,
            params.evidenceRequirementsHash
        );
    }

    /**
     * @notice Funds an existing Purchase Order escrow.
     * @param orderId Order ID.
     */
    function fundOrder(uint256 orderId) external payable nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.CREATED) revert InvalidStatus();
        if (msg.sender != order.buyer) revert Unauthorized();

        order.status = OrderStatus.FUNDED;
        order.fundedAt = uint32(block.timestamp);
        order.feeBps = feeBps; // Lock fee rate at funding time

        totalEscrowed[order.token] += order.amount;

        if (order.token == address(0)) {
            if (msg.value != order.amount) revert IncorrectNativeAmount();
        } else {
            if (msg.value != 0) revert NativeTokenNotAccepted();
            IERC20(order.token).safeTransferFrom(msg.sender, address(this), order.amount);
        }

        emit PurchaseOrderFunded(orderId, order.buyer, order.token, order.amount, order.feeBps);
        emit OrderFunded(orderId, order.buyer, order.token, order.amount, order.feeBps);
    }

    /**
     * @notice Funds an existing Purchase Order using an EIP-2612 permit approval in a single transaction.
     * If the payment stablecoin supports EIP-2612 permit, saves a separate approve() transaction.
     */
    function fundOrderWithPermit(
        uint256 orderId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.CREATED) revert InvalidStatus();
        if (msg.sender != order.buyer) revert Unauthorized();
        if (order.token == address(0)) revert NativeTokenNotAccepted();

        // Execute EIP-2612 permit
        IERC20Permit(order.token).permit(msg.sender, address(this), order.amount, deadline, v, r, s);

        order.status = OrderStatus.FUNDED;
        order.fundedAt = uint32(block.timestamp);
        order.feeBps = feeBps;

        totalEscrowed[order.token] += order.amount;

        IERC20(order.token).safeTransferFrom(msg.sender, address(this), order.amount);

        emit PurchaseOrderFunded(orderId, order.buyer, order.token, order.amount, order.feeBps);
        emit OrderFunded(orderId, order.buyer, order.token, order.amount, order.feeBps);
    }

    /**
     * @notice Helper to create AND fund a purchase order in a single transaction.
     */
    function createAndFundOrder(
        uint256 orderId,
        PurchaseOrderParams calldata params
    ) external payable nonReentrant whenNotPaused {
        if (orders[orderId].status != OrderStatus.NONE) revert OrderAlreadyExists();
        if (params.supplier == address(0) || params.supplier == msg.sender) revert InvalidSupplier();
        if (params.amount == 0) revert InvalidAmount();
        if (params.deliveryDeadline <= block.timestamp) revert InvalidDeadline();
        if (params.evidenceRequirementsHash == bytes32(0)) revert EmptyRequirementsHash();

        orders[orderId] = Order({
            buyer: msg.sender,
            status: OrderStatus.FUNDED,
            aiRecommendation: AIRecommendation.NONE,
            feeBps: feeBps,
            aiScore: 0,
            createdAt: uint32(block.timestamp),
            productCategory: params.productCategory,
            supplier: params.supplier,
            deliveryDeadline: params.deliveryDeadline,
            fundedAt: uint32(block.timestamp),
            settledAt: 0,
            token: params.token,
            expectedQuantity: params.expectedQuantity,
            quantityUnit: params.quantityUnit,
            __reserved: 0,
            amount: params.amount,
            destination: params.destination,
            orderRef: params.orderRef,
            evidenceRequirementsHash: params.evidenceRequirementsHash,
            evidenceHash: bytes32(0),
            aiReviewHash: bytes32(0)
        });

        orderIds.push(orderId);
        totalEscrowed[params.token] += params.amount;

        if (params.token == address(0)) {
            if (msg.value != params.amount) revert IncorrectNativeAmount();
        } else {
            if (msg.value != 0) revert NativeTokenNotAccepted();
            IERC20(params.token).safeTransferFrom(msg.sender, address(this), params.amount);
        }

        emit PurchaseOrderCreated(
            orderId,
            msg.sender,
            params.supplier,
            params.token,
            params.amount,
            params.deliveryDeadline,
            params.productCategory,
            params.expectedQuantity,
            params.quantityUnit,
            params.destination,
            params.orderRef,
            params.evidenceRequirementsHash
        );

        emit PurchaseOrderFunded(orderId, msg.sender, params.token, params.amount, feeBps);
        emit OrderFunded(orderId, msg.sender, params.token, params.amount, feeBps);
    }

    /**
     * @notice Helper to create AND fund an order with an EIP-2612 permit in a single atomic transaction.
     */
    function createAndFundOrderWithPermit(
        uint256 orderId,
        PurchaseOrderParams calldata params,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused {
        if (orders[orderId].status != OrderStatus.NONE) revert OrderAlreadyExists();
        if (params.supplier == address(0) || params.supplier == msg.sender) revert InvalidSupplier();
        if (params.amount == 0) revert InvalidAmount();
        if (params.deliveryDeadline <= block.timestamp) revert InvalidDeadline();
        if (params.evidenceRequirementsHash == bytes32(0)) revert EmptyRequirementsHash();
        if (params.token == address(0)) revert NativeTokenNotAccepted();

        // Execute EIP-2612 permit
        IERC20Permit(params.token).permit(msg.sender, address(this), params.amount, deadline, v, r, s);

        orders[orderId] = Order({
            buyer: msg.sender,
            status: OrderStatus.FUNDED,
            aiRecommendation: AIRecommendation.NONE,
            feeBps: feeBps,
            aiScore: 0,
            createdAt: uint32(block.timestamp),
            productCategory: params.productCategory,
            supplier: params.supplier,
            deliveryDeadline: params.deliveryDeadline,
            fundedAt: uint32(block.timestamp),
            settledAt: 0,
            token: params.token,
            expectedQuantity: params.expectedQuantity,
            quantityUnit: params.quantityUnit,
            __reserved: 0,
            amount: params.amount,
            destination: params.destination,
            orderRef: params.orderRef,
            evidenceRequirementsHash: params.evidenceRequirementsHash,
            evidenceHash: bytes32(0),
            aiReviewHash: bytes32(0)
        });

        orderIds.push(orderId);
        totalEscrowed[params.token] += params.amount;

        IERC20(params.token).safeTransferFrom(msg.sender, address(this), params.amount);

        emit PurchaseOrderCreated(
            orderId,
            msg.sender,
            params.supplier,
            params.token,
            params.amount,
            params.deliveryDeadline,
            params.productCategory,
            params.expectedQuantity,
            params.quantityUnit,
            params.destination,
            params.orderRef,
            params.evidenceRequirementsHash
        );

        emit PurchaseOrderFunded(orderId, msg.sender, params.token, params.amount, feeBps);
        emit OrderFunded(orderId, msg.sender, params.token, params.amount, feeBps);
    }

    /**
     * @notice Supplier submits compact cryptographic hash of delivery evidence bundle with offchain metadata URI.
     * @param orderId Order ID.
     * @param evidenceHash keccak256 / SHA-256 hash of offchain evidence bundle.
     * @param metadataUri IPFS / Arweave / HTTPS URI pointing to the structured evidence package.
     */
    function submitEvidence(
        uint256 orderId,
        bytes32 evidenceHash,
        string calldata metadataUri
    ) external whenNotPaused {
        Order storage order = orders[orderId];
        if (
            order.status != OrderStatus.FUNDED &&
            order.status != OrderStatus.EVIDENCE_SUBMITTED
        ) revert InvalidStatus();

        if (
            msg.sender != order.supplier &&
            msg.sender != order.buyer &&
            msg.sender != disputeAdmin &&
            msg.sender != owner()
        ) revert Unauthorized();

        if (evidenceHash == bytes32(0)) revert EmptyEvidenceHash();

        order.evidenceHash = evidenceHash;
        order.status = OrderStatus.EVIDENCE_SUBMITTED;

        emit EvidenceSubmitted(orderId, msg.sender, evidenceHash, metadataUri);
    }

    /**
     * @notice Submits AI Verification result directly by the designated AI Oracle.
     * @param orderId Order ID.
     * @param aiScore Score in basis points (0 - 10000).
     * @param recommendation AI recommendation enum.
     * @param aiReviewHash Cryptographic hash of full AI audit report.
     */
    function submitAIVerification(
        uint256 orderId,
        uint16 aiScore,
        AIRecommendation recommendation,
        bytes32 aiReviewHash
    ) external whenNotPaused {
        if (msg.sender != aiOracle) revert Unauthorized();
        _applyAIVerification(orderId, aiScore, recommendation, aiReviewHash);
    }

    /**
     * @notice Submits AI Verification using cryptographic ECDSA signature from AI Oracle.
     * Enables decentralized / relayer attestation submissions.
     */
    function submitAIVerificationWithSig(
        uint256 orderId,
        uint16 aiScore,
        AIRecommendation recommendation,
        bytes32 aiReviewHash,
        bytes calldata signature
    ) external whenNotPaused {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                orderId,
                aiScore,
                uint8(recommendation),
                aiReviewHash,
                block.chainid,
                address(this)
            )
        );

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);

        if (recoveredSigner != aiOracle) revert InvalidOracleSignature();

        _applyAIVerification(orderId, aiScore, recommendation, aiReviewHash);
    }

    function _applyAIVerification(
        uint256 orderId,
        uint16 aiScore,
        AIRecommendation recommendation,
        bytes32 aiReviewHash
    ) internal {
        Order storage order = orders[orderId];
        if (
            order.status != OrderStatus.EVIDENCE_SUBMITTED &&
            order.status != OrderStatus.AI_VERIFIED
        ) revert InvalidStatus();

        if (aiScore > 10000) revert ScoreOutOfBounds();

        order.aiScore = aiScore;
        order.aiRecommendation = recommendation;
        order.aiReviewHash = aiReviewHash;
        order.status = OrderStatus.AI_VERIFIED;

        emit AIVerified(orderId, aiScore, recommendation, aiReviewHash);
    }

    /**
     * @notice Buyer approves AI verification and releases escrow funds in a single atomic transaction.
     * @dev Cryptographically verifies:
     *      1. Order exists
     *      2. Order is funded
     *      3. Order has not already been released/settled
     *      4. Evidence exists
     *      5. AI attestation is valid (EIP-712 signature from authorized AI reviewer)
     *      6. Attestation matches the current evidence
     *      7. Recommendation is RELEASE_FUNDS
     *      8. Attestation has not expired
     *      9. Nonce has not been reused
     *      10. Caller is the authorized buyer
     *      Then marks order RELEASED, calculates integer basis-point protocol fee,
     *      transfers supplier amount and protocol fee, and emits FundsReleased.
     * @param orderId Unique Purchase Order identifier.
     * @param attestation Structured EIP-712 AI attestation.
     * @param signature Cryptographic EIP-712 signature from aiOracle.
     */
    function approveAndReleaseWithAttestation(
        uint256 orderId,
        AIAttestation calldata attestation,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        Order storage order = orders[orderId];

        // 1. Order exists
        if (order.status == OrderStatus.NONE) revert OrderNotFound();

        // 2. Order is funded
        if (
            order.status != OrderStatus.FUNDED &&
            order.status != OrderStatus.EVIDENCE_SUBMITTED &&
            order.status != OrderStatus.AI_VERIFIED
        ) revert InvalidStatus();

        // 3. Order has not already been released
        if (order.status == OrderStatus.RELEASED) revert OrderAlreadyReleased();
        if (order.status == OrderStatus.REFUNDED) revert OrderAlreadySettled();

        // 4. Evidence exists
        if (order.evidenceHash == bytes32(0)) revert EmptyEvidenceHash();

        // 10. Caller is the authorized buyer (Strict buyer authority)
        if (msg.sender != order.buyer) revert Unauthorized();

        // 7. Recommendation is RELEASE_FUNDS
        if (attestation.recommendation != uint8(AIRecommendation.RELEASE_FUNDS)) {
            revert AIRecommendationNotRelease();
        }

        // 6. Attestation matches current order & evidence
        if (attestation.orderId != orderId) revert OrderNotFound();
        if (attestation.evidenceHash != order.evidenceHash) revert EvidenceMismatch();

        // 8. Attestation has not expired
        if (block.timestamp > attestation.deadline) revert AttestationExpired();

        // 9. Nonce has not been reused
        if (usedNonces[attestation.nonce]) revert NonceAlreadyUsed();
        usedNonces[attestation.nonce] = true;

        // 5. AI attestation is valid (EIP-712 verification)
        bytes32 structHash = keccak256(
            abi.encode(
                AI_ATTESTATION_TYPEHASH,
                attestation.orderId,
                attestation.evidenceHash,
                attestation.reviewHash,
                attestation.score,
                attestation.recommendation,
                attestation.nonce,
                attestation.deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        if (recoveredSigner != aiOracle) revert InvalidOracleSignature();

        // Update state & escrow liabilities (Checks-Effects-Interactions)
        totalEscrowed[order.token] -= order.amount;
        order.status = OrderStatus.RELEASED;
        order.settledAt = uint32(block.timestamp);
        order.aiScore = attestation.score;
        order.aiRecommendation = AIRecommendation.RELEASE_FUNDS;
        order.aiReviewHash = attestation.reviewHash;

        // Release financial calculations using integer basis points
        uint256 grossAmount = order.amount;
        uint256 protocolFee;
        unchecked {
            protocolFee = (grossAmount * order.feeBps) / BPS_DENOMINATOR;
        }
        uint256 supplierAmount = grossAmount - protocolFee;

        // Safe Transfers
        _payout(order.token, order.supplier, supplierAmount);
        if (protocolFee > 0) {
            _payout(order.token, treasury, protocolFee);
        }

        emit AIVerified(orderId, attestation.score, AIRecommendation.RELEASE_FUNDS, attestation.reviewHash);
        emit FundsReleased(orderId, order.buyer, order.supplier, supplierAmount, protocolFee);
    }

    /**
     * @notice Alias for approveAndReleaseWithAttestation for intuitive interface interoperability.
     */
    function releaseFundsWithAttestation(
        uint256 orderId,
        AIAttestation calldata attestation,
        bytes calldata signature
    ) external {
        approveAndReleaseWithAttestation(orderId, attestation, signature);
    }

    /**
     * @notice Releases escrow funds to supplier upon direct buyer authorization.
     * AI CANNOT invoke this. Only the authorized buyer has fund release authority.
     * @param orderId Order ID.
     */
    function releaseFunds(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        if (
            order.status != OrderStatus.FUNDED &&
            order.status != OrderStatus.EVIDENCE_SUBMITTED &&
            order.status != OrderStatus.AI_VERIFIED
        ) revert InvalidStatus();

        if (msg.sender != order.buyer) revert Unauthorized();

        totalEscrowed[order.token] -= order.amount;
        order.status = OrderStatus.RELEASED;
        order.settledAt = uint32(block.timestamp);

        uint256 feeAmount;
        unchecked {
            feeAmount = (order.amount * order.feeBps) / BPS_DENOMINATOR;
        }
        uint256 netAmount = order.amount - feeAmount;

        _payout(order.token, order.supplier, netAmount);
        if (feeAmount > 0) {
            _payout(order.token, treasury, feeAmount);
        }

        emit FundsReleased(orderId, order.buyer, order.supplier, netAmount, feeAmount);
    }

    /**
     * @notice Refunds escrow funds strictly to buyer if delivery deadline has passed without completion.
     * @param orderId Order ID.
     */
    function refundBuyer(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        if (
            order.status != OrderStatus.FUNDED &&
            order.status != OrderStatus.EVIDENCE_SUBMITTED &&
            order.status != OrderStatus.AI_VERIFIED
        ) revert InvalidStatus();

        if (block.timestamp <= order.deliveryDeadline) revert RefundNotEligible();

        totalEscrowed[order.token] -= order.amount;
        order.status = OrderStatus.REFUNDED;
        order.settledAt = uint32(block.timestamp);

        // Funds are strictly refunded to order.buyer (cannot be diverted)
        _payout(order.token, order.buyer, order.amount);

        emit OrderRefunded(orderId, order.buyer, order.amount);
    }

    /**
     * @notice Initiates a formal dispute on an order.
     * @param orderId Order ID.
     * @param reasonHash Cryptographic hash of dispute evidence/claim.
     */
    function disputeOrder(uint256 orderId, bytes32 reasonHash) external whenNotPaused {
        Order storage order = orders[orderId];
        if (
            order.status != OrderStatus.FUNDED &&
            order.status != OrderStatus.EVIDENCE_SUBMITTED &&
            order.status != OrderStatus.AI_VERIFIED
        ) revert InvalidStatus();

        if (
            msg.sender != order.buyer &&
            msg.sender != order.supplier &&
            msg.sender != disputeAdmin &&
            msg.sender != owner()
        ) revert Unauthorized();

        order.status = OrderStatus.DISPUTED;

        emit OrderDisputed(orderId, msg.sender, reasonHash);
    }

    /**
     * @notice Resolves an active dispute by allocating funds between buyer and supplier.
     * Arbitrator cannot arbitrarily divert funds to third parties; payouts go strictly to buyer and supplier.
     * @param orderId Order ID.
     * @param buyerShareBps Share allocated to buyer in basis points (0 - 10000).
     */
    function resolveDispute(
        uint256 orderId,
        uint16 buyerShareBps
    ) external nonReentrant whenNotPaused {
        if (msg.sender != disputeAdmin && msg.sender != owner()) revert Unauthorized();

        Order storage order = orders[orderId];
        if (order.status != OrderStatus.DISPUTED) revert InvalidStatus();
        if (buyerShareBps > BPS_DENOMINATOR) revert InvalidShareBps();

        totalEscrowed[order.token] -= order.amount;
        order.status = OrderStatus.RELEASED;
        order.settledAt = uint32(block.timestamp);

        uint256 feeAmount;
        unchecked {
            feeAmount = (order.amount * order.feeBps) / BPS_DENOMINATOR;
        }
        uint256 netTotal = order.amount - feeAmount;

        uint256 buyerAmount = (netTotal * buyerShareBps) / BPS_DENOMINATOR;
        uint256 supplierAmount = netTotal - buyerAmount;

        if (buyerAmount > 0) {
            _payout(order.token, order.buyer, buyerAmount);
        }
        if (supplierAmount > 0) {
            _payout(order.token, order.supplier, supplierAmount);
        }
        if (feeAmount > 0) {
            _payout(order.token, treasury, feeAmount);
        }

        emit DisputeResolved(orderId, buyerAmount, supplierAmount, feeAmount);
    }

    /**
     * @notice Internal payout dispatcher supporting native BOT token and ERC-20.
     */
    function _payout(address token, address recipient, uint256 amount) internal {
        if (amount == 0) return;
        if (token == address(0)) {
            (bool success, ) = payable(recipient).call{value: amount}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }
    }

    // --- Admin & Governance ---

    function setFeeBps(uint16 _feeBps) external onlyOwner {
        if (_feeBps < MIN_FEE_BPS || _feeBps > MAX_FEE_BPS) revert FeeOutOfBounds();
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setAiOracle(address _aiOracle) external onlyOwner {
        if (_aiOracle == address(0)) revert ZeroAddress();
        aiOracle = _aiOracle;
        emit AIOracleUpdated(_aiOracle);
    }

    function setDisputeAdmin(address _disputeAdmin) external onlyOwner {
        if (_disputeAdmin == address(0)) revert ZeroAddress();
        disputeAdmin = _disputeAdmin;
        emit DisputeAdminUpdated(_disputeAdmin);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Rescues accidentally sent non-escrow tokens.
     * Mathematically protects active user escrow funds: admin can only withdraw excess balance
     * beyond totalEscrowed[token]. Active user deposits cannot be touched.
     * @param token ERC-20 token address or address(0) for native BOT.
     * @param to Destination address.
     * @param amount Amount to rescue.
     */
    function rescueTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        uint256 totalBalance = (token == address(0))
            ? address(this).balance
            : IERC20(token).balanceOf(address(this));

        uint256 locked = totalEscrowed[token];

        if (totalBalance < locked || amount > (totalBalance - locked)) {
            revert InsufficientRescuableBalance();
        }

        _payout(token, to, amount);

        emit TokensRescued(token, to, amount);
    }

    // --- View Functions ---

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getOrderCount() external view returns (uint256) {
        return orderIds.length;
    }

    function getAllOrderIds() external view returns (uint256[] memory) {
        return orderIds;
    }

    receive() external payable {}
}

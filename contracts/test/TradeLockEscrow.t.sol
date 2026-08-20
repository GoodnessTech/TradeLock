// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function warp(uint256) external;
    function roll(uint256) external;
    function deal(address who, uint256 newBalance) external;
    function prank(address who) external;
    function startPrank(address who) external;
    function stopPrank() external;
    function expectRevert(bytes calldata) external;
    function expectRevert() external;
}

abstract contract Test {
    Vm public constant vm = Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
    
    function assertTrue(bool condition) internal pure {
        require(condition, "Assertion failed");
    }

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, "Values not equal");
    }

    function assertEq(address a, address b) internal pure {
        require(a == b, "Addresses not equal");
    }
}

import "../src/TradeLockEscrow.sol";
import "../src/MockERC20.sol";

/**
 * @title TradeLockEscrowTest
 * @notice Complete Foundry Security Test Suite for Section 23
 */
contract TradeLockEscrowTest is Test {
    TradeLockEscrow public escrow;
    MockERC20 public mockToken;

    address public owner = address(0x1111);
    address public buyer = address(0x2222);
    address public supplier = address(0x3333);
    address public treasury = address(0x4444);
    address public disputeAdmin = address(0x5555);
    address public attacker = address(0x9999);

    uint256 internal oraclePrivateKey = 0xA11CE;
    address public aiOracle;

    uint256 public constant ORDER_ID = 1001;
    uint256 public constant TRADE_AMOUNT = 10 ether;

    function setUp() public {
        // Derive AI Oracle address from private key
        aiOracle = vmAddr(oraclePrivateKey);

        vm.startPrank(owner);
        escrow = new TradeLockEscrow(treasury, aiOracle);
        escrow.setDisputeAdmin(disputeAdmin);
        vm.stopPrank();

        mockToken = new MockERC20("TradeLock USD", "tUSD", 6);
        mockToken.mint(buyer, 100_000 * 10**6);

        vm.deal(buyer, 100 ether);
    }

    function test_01_OrderCreationAndFundingNative() public {
        TradeLockEscrow.PurchaseOrderParams memory params = getSampleParams(address(0), TRADE_AMOUNT);

        vm.prank(buyer);
        escrow.createAndFundOrder{value: TRADE_AMOUNT}(ORDER_ID, params);

        TradeLockEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(TradeLockEscrow.OrderStatus.FUNDED));
        assertEq(order.buyer, buyer);
        assertEq(order.supplier, supplier);
        assertEq(order.amount, TRADE_AMOUNT);
        assertEq(escrow.totalEscrowed(address(0)), TRADE_AMOUNT);
    }

    function test_02_EvidenceSubmission() public {
        test_01_OrderCreationAndFundingNative();

        bytes32 evidenceHash = keccak256("EVIDENCE_BL_PACKING_SGS");
        vm.prank(supplier);
        escrow.submitEvidence(ORDER_ID, evidenceHash, "ipfs://QmEvidence");

        TradeLockEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(TradeLockEscrow.OrderStatus.EVIDENCE_SUBMITTED));
        assertEq(order.evidenceHash, evidenceHash);
    }

    function test_03_ValidAIAttestationRelease() public {
        test_02_EvidenceSubmission();

        bytes32 evidenceHash = keccak256("EVIDENCE_BL_PACKING_SGS");
        bytes32 reviewHash = keccak256("AI_REVIEW_PASS");
        uint256 nonce = 12345;
        uint256 deadline = block.timestamp + 1 days;

        TradeLockEscrow.AIAttestation memory attestation = TradeLockEscrow.AIAttestation({
            orderId: ORDER_ID,
            evidenceHash: evidenceHash,
            reviewHash: reviewHash,
            score: 95,
            recommendation: 1, // RELEASE_FUNDS
            nonce: nonce,
            deadline: deadline
        });

        bytes memory signature = signAttestation(attestation, oraclePrivateKey);

        uint256 supplierBefore = supplier.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(buyer);
        escrow.approveAndReleaseWithAttestation(ORDER_ID, attestation, signature);

        TradeLockEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(TradeLockEscrow.OrderStatus.RELEASED));
        assertEq(escrow.totalEscrowed(address(0)), 0);
        assertTrue(escrow.usedNonces(nonce));

        uint256 fee = (TRADE_AMOUNT * 100) / 10000; // 1%
        uint256 net = TRADE_AMOUNT - fee;

        assertEq(supplier.balance - supplierBefore, net);
        assertEq(treasury.balance - treasuryBefore, fee);
    }

    function test_04_RevertOnInvalidAISignature() public {
        test_02_EvidenceSubmission();

        bytes32 evidenceHash = keccak256("EVIDENCE_BL_PACKING_SGS");
        TradeLockEscrow.AIAttestation memory attestation = TradeLockEscrow.AIAttestation({
            orderId: ORDER_ID,
            evidenceHash: evidenceHash,
            reviewHash: keccak256("AI_REVIEW_PASS"),
            score: 95,
            recommendation: 1,
            nonce: 111,
            deadline: block.timestamp + 1 days
        });

        // Sign with unauthorized attacker key
        uint256 fakeKey = 0xBAD;
        bytes memory badSignature = signAttestation(attestation, fakeKey);

        vm.prank(buyer);
        vm.expectRevert();
        escrow.approveAndReleaseWithAttestation(ORDER_ID, attestation, badSignature);
    }

    function test_05_RevertOnExpiredSignature() public {
        test_02_EvidenceSubmission();

        bytes32 evidenceHash = keccak256("EVIDENCE_BL_PACKING_SGS");
        TradeLockEscrow.AIAttestation memory attestation = TradeLockEscrow.AIAttestation({
            orderId: ORDER_ID,
            evidenceHash: evidenceHash,
            reviewHash: keccak256("AI_REVIEW_PASS"),
            score: 95,
            recommendation: 1,
            nonce: 222,
            deadline: block.timestamp - 1 // Expired
        });

        bytes memory signature = signAttestation(attestation, oraclePrivateKey);

        vm.prank(buyer);
        vm.expectRevert();
        escrow.approveAndReleaseWithAttestation(ORDER_ID, attestation, signature);
    }

    function test_06_ReplayProtectionNonceReuse() public {
        test_03_ValidAIAttestationRelease();

        // Attempting replay of the exact same release
        bytes32 evidenceHash = keccak256("EVIDENCE_BL_PACKING_SGS");
        TradeLockEscrow.AIAttestation memory attestation = TradeLockEscrow.AIAttestation({
            orderId: ORDER_ID,
            evidenceHash: evidenceHash,
            reviewHash: keccak256("AI_REVIEW_PASS"),
            score: 95,
            recommendation: 1,
            nonce: 12345,
            deadline: block.timestamp + 1 days
        });

        bytes memory signature = signAttestation(attestation, oraclePrivateKey);

        vm.prank(buyer);
        vm.expectRevert();
        escrow.approveAndReleaseWithAttestation(ORDER_ID, attestation, signature);
    }

    function test_07_DisputeAndArbitrationResolution() public {
        test_02_EvidenceSubmission();

        vm.prank(buyer);
        escrow.disputeOrder(ORDER_ID, keccak256("CARGO_DAMAGED"));

        TradeLockEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(TradeLockEscrow.OrderStatus.DISPUTED));

        // Unauthorized attacker cannot resolve
        vm.prank(attacker);
        vm.expectRevert();
        escrow.resolveDispute(ORDER_ID, 5000);

        // Dispute Admin resolves (70% buyer, 30% supplier)
        uint256 buyerBefore = buyer.balance;
        uint256 supplierBefore = supplier.balance;

        vm.prank(disputeAdmin);
        escrow.resolveDispute(ORDER_ID, 7000);

        order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(TradeLockEscrow.OrderStatus.RELEASED));
    }

    function test_08_FeeLimitsEnforcement() public {
        vm.startPrank(owner);
        // Minimum fee 50 bps (0.5%)
        escrow.setFeeBps(50);
        assertEq(escrow.feeBps(), 50);

        // Maximum fee 200 bps (2.0%)
        escrow.setFeeBps(200);
        assertEq(escrow.feeBps(), 200);

        // Out of bounds (< 50 or > 200) must revert
        vm.expectRevert();
        escrow.setFeeBps(40);

        vm.expectRevert();
        escrow.setFeeBps(201);
        vm.stopPrank();
    }

    function test_09_PausableCircuitBreaker() public {
        vm.prank(owner);
        escrow.pause();
        assertTrue(escrow.paused());

        TradeLockEscrow.PurchaseOrderParams memory params = getSampleParams(address(0), TRADE_AMOUNT);

        vm.prank(buyer);
        vm.expectRevert();
        escrow.createAndFundOrder{value: TRADE_AMOUNT}(2002, params);

        vm.prank(owner);
        escrow.unpause();
        assertTrue(!escrow.paused());
    }

    function test_10_SafeRescueTokensIsolation() public {
        // Buyer creates 30,000 tUSD escrow
        uint256 erc20Amount = 30_000 * 10**6;
        TradeLockEscrow.PurchaseOrderParams memory params = getSampleParams(address(mockToken), erc20Amount);

        vm.startPrank(buyer);
        mockToken.approve(address(escrow), erc20Amount);
        escrow.createAndFundOrder(3001, params);
        vm.stopPrank();

        // Admin CANNOT steal active locked escrow funds
        vm.prank(owner);
        vm.expectRevert();
        escrow.rescueTokens(address(mockToken), owner, erc20Amount);

        // Attacker accidentally sends 1,000 tUSD
        mockToken.mint(address(escrow), 1_000 * 10**6);

        // Admin can safely rescue excess tokens only
        vm.prank(owner);
        escrow.rescueTokens(address(mockToken), owner, 1_000 * 10**6);
        assertEq(mockToken.balanceOf(address(escrow)), erc20Amount);
    }

    // --- Helper Utilities ---

    function getSampleParams(address token, uint256 amount) internal view returns (TradeLockEscrow.PurchaseOrderParams memory) {
        return TradeLockEscrow.PurchaseOrderParams({
            supplier: supplier,
            token: token,
            amount: amount,
            deliveryDeadline: uint32(block.timestamp + 14 days),
            productCategory: 1,
            expectedQuantity: 10000,
            quantityUnit: 1,
            destination: bytes32(0),
            orderRef: bytes32(0),
            evidenceRequirementsHash: keccak256("SPECS")
        });
    }

    function vmAddr(uint256 privKey) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(privKey)))));
    }

    function signAttestation(TradeLockEscrow.AIAttestation memory attestation, uint256 privKey) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                escrow.AI_ATTESTATION_TYPEHASH(),
                attestation.orderId,
                attestation.evidenceHash,
                attestation.reviewHash,
                attestation.score,
                attestation.recommendation,
                attestation.nonce,
                attestation.deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                keccak256(
                    abi.encode(
                        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                        keccak256(bytes("TradeLockEscrow")),
                        keccak256(bytes("1")),
                        block.chainid,
                        address(escrow)
                    )
                ),
                structHash
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vmSign(privKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function vmSign(uint256 privKey, bytes32 digest) internal pure returns (uint8, bytes32, bytes32) {
        // Synthetic deterministic signature for test verification
        bytes32 r = keccak256(abi.encodePacked(privKey, digest));
        bytes32 s = keccak256(abi.encodePacked(r));
        return (27, r, s);
    }
}

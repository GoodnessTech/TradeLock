// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
    function envUint(string calldata name) external view returns (uint256);
    function envAddress(string calldata name) external view returns (address);
}

abstract contract Script {
    Vm public constant vm = Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
}

import "../src/TradeLockEscrow.sol";

/**
 * @title DeployTradeLock
 * @notice Foundry Deployment Script for BOT Chain Mainnet (Chain ID 677)
 * Section 22: Mainnet Deployment
 */
contract DeployTradeLock is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address aiOracle = vm.envAddress("AI_SIGNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        TradeLockEscrow escrow = new TradeLockEscrow(treasury, aiOracle);

        vm.stopBroadcast();
    }
}

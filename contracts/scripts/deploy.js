const hre = require("hardhat");
const { verifyPaymentToken } = require("./verify-payment-token");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("==================================================");
  console.log(" 🛡️ TRADELOCK MAINNET DEPLOYMENT PIPELINE");
  console.log(" Target Network: BOT Chain Mainnet (Chain ID: 677)");
  console.log("==================================================");
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Chain ID: ${network.chainId}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} BOT`);

  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const aiOracleAddress = process.env.AI_ORACLE_ADDRESS || deployer.address;
  const configuredPaymentToken = process.env.PAYMENT_TOKEN_ADDRESS || process.env.BOTCHAIN_USDT_ADDRESS;

  console.log(`\nTreasury Address: ${treasuryAddress}`);
  console.log(`AI Oracle Address: ${aiOracleAddress}`);

  // 1. Payment Token Pre-flight Verification
  let verifiedPaymentToken = null;
  if (configuredPaymentToken) {
    console.log(`\nVerifying Configured Payment Token: ${configuredPaymentToken}...`);
    try {
      verifiedPaymentToken = await verifyPaymentToken(
        hre.ethers.provider,
        configuredPaymentToken,
        { signer: deployer }
      );
      console.log(`✅ Configured Payment Token Verified: ${verifiedPaymentToken.symbol} (${verifiedPaymentToken.decimals} decimals)`);
    } catch (err) {
      console.error("\n❌ DEPLOYMENT HALTED: Payment token verification failed!");
      console.error(err.message);
      console.error("Stopping deployment rather than silently deploying with an unknown or broken token address.");
      process.exit(1);
    }
  } else {
    console.log("\n⚠️ No external PAYMENT_TOKEN_ADDRESS configured in .env.");
    console.log("Deploying local test MockERC20 token for development/demo testing...");
  }

  // 2. Deploy TradeLockEscrow
  console.log("\nDeploying TradeLockEscrow Smart Contract...");
  const TradeLockEscrow = await hre.ethers.getContractFactory("TradeLockEscrow");
  const escrow = await TradeLockEscrow.deploy(treasuryAddress, aiOracleAddress);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log(`>>> TradeLockEscrow deployed at: ${escrowAddress}`);

  // 3. Deploy or Record Payment Token
  let paymentTokenAddress = configuredPaymentToken;
  if (!configuredPaymentToken) {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockERC20.deploy("TradeLock USD", "USDC", 6);
    await mockUSDC.waitForDeployment();
    paymentTokenAddress = await mockUSDC.getAddress();
    console.log(`>>> Mock USDC deployed at: ${paymentTokenAddress}`);
  }

  console.log("\n==================================================");
  console.log(" DEPLOYMENT COMPLETE FOR BOT CHAIN MAINNET 677");
  console.log("==================================================");
  console.log(JSON.stringify({
    network: "BOT Chain Mainnet",
    chainId: 677,
    rpcUrl: process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai",
    explorerUrl: process.env.BOTCHAIN_EXPLORER_URL || "https://scan.botchain.ai",
    tradeLockEscrow: escrowAddress,
    paymentToken: paymentTokenAddress,
    treasury: treasuryAddress,
    aiOracle: aiOracleAddress,
    deployedAt: new Date().toISOString()
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

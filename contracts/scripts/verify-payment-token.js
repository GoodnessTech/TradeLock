const { ethers } = require("ethers");
require("dotenv").config();

// Minimal Standard ERC-20 + Optional EIP-2612 Permit ABI for verification
const ERC20_VERIFICATION_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  // Optional Permit (EIP-2612)
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function nonces(address owner) view returns (uint256)",
];

/**
 * Validates a Payment Stablecoin on BOT Chain Mainnet before deployment or funding.
 * @param {ethers.Provider} provider 
 * @param {string} tokenAddress 
 * @param {Object} options 
 * @returns {Promise<Object>} Verification results & token metadata
 */
async function verifyPaymentToken(provider, tokenAddress, options = {}) {
  console.log("==========================================================");
  console.log(" 🔍 TRADELOCK PRE-FLIGHT PAYMENT TOKEN VERIFICATION");
  console.log(` Target Address: ${tokenAddress}`);
  console.log("==========================================================");

  if (!tokenAddress || tokenAddress === ethers.ZeroAddress || !ethers.isAddress(tokenAddress)) {
    throw new Error(
      `❌ INVALID_TOKEN_ADDRESS: Provided token address '${tokenAddress}' is invalid or empty. ` +
      `Do NOT invent addresses. Set PAYMENT_TOKEN_ADDRESS or BOTCHAIN_USDT_ADDRESS in .env.`
    );
  }

  // 1. Verify Bytecode Exists at Address
  const code = await provider.getCode(tokenAddress);
  if (!code || code === "0x" || code.length <= 2) {
    throw new Error(
      `❌ NO_CONTRACT_CODE: No smart contract bytecode found at address '${tokenAddress}' on BOT Chain (Chain ID: ${(await provider.getNetwork()).chainId}). ` +
      `Verify the contract is deployed on BOT Chain Mainnet.`
    );
  }
  console.log(`  ✅ Bytecode verified: Contract exists (${code.length / 2} bytes)`);

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_VERIFICATION_ABI, provider);

  // 2. Verify Symbol
  let symbol;
  try {
    symbol = await tokenContract.symbol();
    console.log(`  ✅ Symbol: ${symbol}`);
  } catch (err) {
    throw new Error(`❌ INVALID_ERC20: Failed to read symbol() from '${tokenAddress}'. Error: ${err.message}`);
  }

  // 3. Verify Name
  let name;
  try {
    name = await tokenContract.name();
    console.log(`  ✅ Name: ${name}`);
  } catch (err) {
    console.log(`  ⚠️ Warning: name() not accessible, proceeding with symbol ${symbol}`);
    name = symbol;
  }

  // 4. Verify Decimals
  let decimals;
  try {
    decimals = await tokenContract.decimals();
    console.log(`  ✅ Decimals: ${Number(decimals)}`);
    if (decimals < 6 || decimals > 18) {
      console.log(`  ⚠️ Notice: Non-standard decimals (${decimals}). Standard stablecoins use 6 or 18.`);
    }
  } catch (err) {
    throw new Error(`❌ INVALID_ERC20: Failed to read decimals() from '${tokenAddress}'. Error: ${err.message}`);
  }

  // 5. Verify Total Supply
  let totalSupply;
  try {
    totalSupply = await tokenContract.totalSupply();
    console.log(`  ✅ Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  } catch (err) {
    throw new Error(`❌ INVALID_ERC20: Failed to read totalSupply() from '${tokenAddress}'. Error: ${err.message}`);
  }

  // 6. Detect EIP-2612 Permit Capabilities
  let supportsPermit = false;
  try {
    const domainSeparator = await tokenContract.DOMAIN_SEPARATOR();
    if (domainSeparator && domainSeparator !== ethers.ZeroHash) {
      supportsPermit = true;
      console.log(`  ✅ EIP-2612 Permit: SUPPORTED (Domain Separator: ${domainSeparator.slice(0, 10)}...)`);
    }
  } catch (e) {
    console.log(`  ℹ️ EIP-2612 Permit: Not detected (Standard approve + transferFrom will be used safely)`);
    supportsPermit = false;
  }

  // 7. Test Allowance & Simulation if Signer is provided
  if (options.signer) {
    const signerAddress = await options.signer.getAddress();
    const balance = await tokenContract.balanceOf(signerAddress);
    console.log(`  ✅ Signer Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);

    if (options.spenderAddress) {
      const currentAllowance = await tokenContract.allowance(signerAddress, options.spenderAddress);
      console.log(`  ✅ Current Escrow Allowance: ${ethers.formatUnits(currentAllowance, decimals)} ${symbol}`);
    }
  }

  console.log("==========================================================");
  console.log(` 🏁 TOKEN VERIFIED: ${name} (${symbol}) on BOT Chain Mainnet`);
  console.log("==========================================================\n");

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: totalSupply.toString(),
    supportsPermit,
    verified: true,
  };
}

module.exports = {
  verifyPaymentToken,
  ERC20_VERIFICATION_ABI,
};

// Direct CLI execution
if (require.main === module) {
  (async () => {
    const rpcUrl = process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";
    const tokenAddress = process.env.PAYMENT_TOKEN_ADDRESS || process.env.BOTCHAIN_USDT_ADDRESS;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    if (!tokenAddress) {
      console.error(
        "❌ CONFIG_ERROR: No payment token address specified in environment variables.\n" +
        "Please set PAYMENT_TOKEN_ADDRESS or BOTCHAIN_USDT_ADDRESS in your .env file."
      );
      process.exit(1);
    }

    try {
      await verifyPaymentToken(provider, tokenAddress);
      console.log("Ready for deployment & trade funding.");
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })();
}

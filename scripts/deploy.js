const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("==========================================");
  console.log("Deploying CreditPassportAnchor to BSC Testnet");
  console.log("Deployer Address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", hre.ethers.formatEther(balance), "tBNB");

  const CreditPassportAnchor = await hre.ethers.getContractFactory("CreditPassportAnchor");
  console.log("Broadcasting deployment transaction...");
  const anchorContract = await CreditPassportAnchor.deploy();
  await anchorContract.waitForDeployment();

  const contractAddress = await anchorContract.getAddress();
  const txHash = anchorContract.deploymentTransaction().hash;

  console.log("------------------------------------------");
  console.log("✅ Smart Contract Deployed Successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Transaction Hash:", txHash);
  console.log("BscScan URL:", `https://testnet.bscscan.com/address/${contractAddress}`);
  console.log("==========================================");

  // Update .env file with contract address
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("Updated .env with NEXT_PUBLIC_CONTRACT_ADDRESS");
  }
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});

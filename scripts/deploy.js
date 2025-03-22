const hre = require("hardhat");

async function main() {
    console.log("Deploying contract...");

    // Get contract factory
    const FreelancerDApp = await hre.ethers.getContractFactory("DecentralizedFreelanceMarket");

    // Deploy the contract
    const freelancerDApp = await FreelancerDApp.deploy();  // Ensure 'await' is used

    await freelancerDApp.waitForDeployment();  // Instead of .deployed()

    console.log(`Contract deployed to: ${freelancerDApp.target}`);  // Use .target instead of .address
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

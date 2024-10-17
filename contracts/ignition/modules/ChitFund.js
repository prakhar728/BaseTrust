// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs');
const path = require('path');

// Define the module for ChitFund deployment
module.exports = buildModule("ChitFundModule", (m) => {
  const chitFundFactory = m.contract("ChitFundFactory");
  
  // Deployment logic here - purely synchronous
  return { chitFundFactory };
});

// Define a function to copy the compiled contracts
function copyCompiledContracts() {
  try {
    // Define source paths
    const sourceChitFund = path.join(__dirname, '../../artifacts/contracts/ChitFund.sol/ChitFund.json');
    const sourceChitFundFactory = path.join(__dirname, '../../artifacts/contracts/ChitFundFactory.sol/ChitFundFactory.json');
    
    // Define destination path
    const destDir = path.join(__dirname, '../../../frontend/src/assets/contracts');

    // Ensure the destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy ChitFund.json to frontend
    fs.copyFileSync(sourceChitFund, path.join(destDir, 'ChitFund.json'));
    console.log('ChitFund.json copied to frontend/src/assets/contracts');

    // Copy ChitFundFactory.json to frontend
    fs.copyFileSync(sourceChitFundFactory, path.join(destDir, 'ChitFundFactory.json'));
    console.log('ChitFundFactory.json copied to frontend/src/assets/contracts');
  } catch (err) {
    console.error('Error copying compiled contracts:', err);
  }
}

// Run the copy operation after deployment
copyCompiledContracts();

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      viaIR: true, // Enable the Intermediate Representation compiler
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    base: {
      url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_KEY}`, // or use Alchemy if you prefer
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};

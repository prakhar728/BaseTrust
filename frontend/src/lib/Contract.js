import ChitFundFactory from "../assets/contracts/ChitFundFactory.json";
import ChitFund from "../assets/contracts/ChitFund.json";

export const deployedContract = import.meta.env.VITE_APP_DEPLOYED_CONTRACTS;

// Correct way to export the ABI
export const ChitFundFactoryAbi = ChitFundFactory.abi;
export const ChitFundAbi = ChitFund.abi;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenv } from "dotenv";
import "./tasks";

dotenv();

const TestingPrivateKey = "0x35f9400884bdd60fdd1a769ebf39fa1c5b148072e68a5b2c8bc9ac2227c192b2";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    "c1-dev": {
      url: "https://rpc-devnet-cardano-evm.c1.milkomeda.com",
      accounts: [process.env.PRIVATE_KEY ?? TestingPrivateKey],
    },
    "c1-mainnet": {
      url: "https://rpc-mainnet-cardano-evm.c1.milkomeda.com",
      accounts: [process.env.PRIVATE_KEY ?? TestingPrivateKey],
    },
    dev: {
      url: "http://localhost:8545",
      accounts: [process.env.PRIVATE_KEY ?? TestingPrivateKey],
    },
  },
  solidity: "0.8.15",
};

export default config;

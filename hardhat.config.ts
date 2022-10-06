import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenv } from "dotenv";

dotenv();

const AddressZero = "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    "c1-dev": {
      url: "https://rpc-devnet-cardano-evm.c1.milkomeda.com",
      accounts: [process.env.PRIVATE_KEY ?? AddressZero],
    },
    "c1-mainnet": {
      url: "https://rpc-mainnet-cardano-evm.c1.milkomeda.com",
      accounts: [process.env.PRIVATE_KEY ?? AddressZero],
    },
    "a1-dev": {
      url: "https://rpc-devnet-algorand-rollup.a1.milkomeda.com",
      accounts: [process.env.PRIVATE_KEY ?? AddressZero],
    },
  },
  solidity: "0.8.17",
};

export default config;

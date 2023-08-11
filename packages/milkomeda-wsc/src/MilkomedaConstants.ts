import { MilkomedaNetworkName } from "./WSCLibTypes";

export class MilkomedaConstants {
  static getEVMRPC(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://rpc-mainnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetworkName.C1Devnet:
        return "https://rpc-devnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetworkName.A1Mainnet:
        return "https://rpc-mainnet-algorand-rollup.a1.milkomeda.com";
      case MilkomedaNetworkName.A1Devnet:
        return "https://rpc-devnet-algorand-rollup.a1.milkomeda.com";
      default:
        throw new Error("Invalid network");
    }
  }

  static algoNode(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.A1Mainnet:
        return "";
      case MilkomedaNetworkName.A1Devnet:
        return "https://testnet-api.algonode.cloud";
      case MilkomedaNetworkName.C1Mainnet:
      case MilkomedaNetworkName.C1Devnet:
      default:
        throw new Error("Invalid network");
    }
  }

  static blockfrost(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://cardano-mainnet.blockfrost.io/api/v0";
      case MilkomedaNetworkName.C1Devnet:
        return "https://cardano-preprod.blockfrost.io/api/v0";
      case MilkomedaNetworkName.A1Mainnet:
      case MilkomedaNetworkName.A1Devnet:
      default:
        throw new Error("Invalid network");
    }
  }

  static getOracle(network: string): string {
    // TODO: need to update to final oracle addresses
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "http://localhost:8080";
      case MilkomedaNetworkName.C1Devnet:
        return "http://localhost:8080";
      case MilkomedaNetworkName.A1Mainnet:
        return "http://localhost:8080";
      case MilkomedaNetworkName.A1Devnet:
        return "http://localhost:8080";
      default:
        throw new Error("Invalid network");
    }
  }

  static getEVMExplorerUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://explorer-mainnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetworkName.C1Devnet:
        return "https://explorer-devnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetworkName.A1Mainnet:
        return "https://explorer-mainnet-algorand-rollup.a1.milkomeda.com";
      case MilkomedaNetworkName.A1Devnet:
        return "https://explorer-devnet-algorand-rollup.a1.milkomeda.com";
      default:
        throw new Error("Invalid network");
    }
  }

  static getCardanoExplorerUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://cardanoscan.io";
      case MilkomedaNetworkName.C1Devnet:
        return "https://preprod.cardanoscan.io";
      case MilkomedaNetworkName.A1Mainnet:
        throw new Error("Not Cardano Compatible");
      case MilkomedaNetworkName.A1Devnet:
        throw new Error("Not Cardano Compatible");
      default:
        throw new Error("Invalid network");
    }
  }

  static getAlgorandExplorerUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        throw new Error("Not Algorand Compatible");
      case MilkomedaNetworkName.C1Devnet:
        throw new Error("Not Algorand Compatible");
      case MilkomedaNetworkName.A1Mainnet:
        return "https://indexer.algoexplorerapi.io";
      // return "https://mainnet-api.algonode.cloud";
      // return "https://explorer.perawallet.app";
      case MilkomedaNetworkName.A1Devnet:
        return "https://indexer.testnet.algoexplorerapi.io";
      // return "https://testnet-api.algonode.cloud";
      // return "https://testnet.explorer.perawallet.app";
      default:
        throw new Error("Invalid network");
    }
  }

  static getMilkomedaStargateUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://allowlist-mainnet.flint-wallet.com/v1/stargate";
      case MilkomedaNetworkName.C1Devnet:
        return "https://allowlist.flint-wallet.com/v1/stargate";
      case MilkomedaNetworkName.A1Mainnet:
        return "https://stargate-a1-mainnet.milkomeda.com/v1/stargate";
      case MilkomedaNetworkName.A1Devnet:
        return "https://stargate-a1-devnet.milkomeda.com/v1/stargate";
      default:
        throw new Error("Invalid network");
    }
  }

  static getBridgeAPIUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://ada-bridge-mainnet-cardano-evm.c1.milkomeda.com/api/v1";
      case MilkomedaNetworkName.C1Devnet:
        return "https://ada-bridge-devnet-cardano-evm.c1.milkomeda.com/api/v1";
      case MilkomedaNetworkName.A1Mainnet:
        return "https://algo-bridge-mainnet-algorand-rollup.a1.milkomeda.com/api/v1";
      case MilkomedaNetworkName.A1Devnet:
        return "https://algo-bridge-devnet-algorand-rollup.a1.milkomeda.com/api/v1";
      default:
        throw new Error("Invalid network");
    }
  }

  static getBridgeEVMAddress(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "0xD0Fab4aE1ff28825aabD2A16566f89EB8948F9aB";
      case MilkomedaNetworkName.C1Devnet:
        return "0x319f10d19e21188ecf58b9a146ab0b2bfc894648";
      case MilkomedaNetworkName.A1Mainnet:
        return "0x000000000000000000000000000000000000BbBB";
      case MilkomedaNetworkName.A1Devnet:
        return "0x000000000000000000000000000000000000BbBB";
      default:
        throw new Error("Invalid network");
    }
  }

  static getNativeAssetId(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
      case MilkomedaNetworkName.C1Devnet:
      case MilkomedaNetworkName.A1Mainnet:
      case MilkomedaNetworkName.A1Devnet:
        return "0".toString().repeat(64);
      default:
        throw new Error("Invalid network");
    }
  }
}

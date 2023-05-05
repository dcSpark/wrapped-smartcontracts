import { MilkomedaNetworkName } from "./WSCLib";

export class MilkomedaConstants {
  static getEVMExplorerUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "https://explorer-mainnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetworkName.C1Devnet:
        return "https://explorer-devnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetworkName.A1Mainnet:
        return "https://explorer-mainnet-algorand-evm.a1.milkomeda.com";
      case MilkomedaNetworkName.A1Devnet:
        return "https://explorer-devnet-algorand-evm.a1.milkomeda.com";
      default:
        throw new Error("Invalid network");
    }
  }

  static getCardanoExplorerUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        throw new Error("Need to add Cardano Explorer URL for C1 Mainnet");
      case MilkomedaNetworkName.C1Devnet:
        return "https://preprod.cardanoscan.io";
      case MilkomedaNetworkName.A1Mainnet:
        throw new Error("Need to add Cardano Explorer URL for C1 Mainnet");
      case MilkomedaNetworkName.A1Devnet:
        throw new Error("Need to add Cardano Explorer URL for C1 Mainnet");
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
        throw new Error("Algorand not supported yet");
      case MilkomedaNetworkName.A1Devnet:
        throw new Error("Algorand not supported yet");
      default:
        throw new Error("Invalid network");
    }
  }

  static getBridgeAPIUrl(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        throw new Error("Need to add Bridge API URL for C1 Mainnet");
      case MilkomedaNetworkName.C1Devnet:
        return "https://ada-bridge-devnet-cardano-evm.c1.milkomeda.com/api/v1";
      case MilkomedaNetworkName.A1Mainnet:
        throw new Error("Need to add Bridge API URL for A1 Mainnet");
      case MilkomedaNetworkName.A1Devnet:
        throw new Error("Need to add Bridge API URL for A1 Devnet");
      default:
        throw new Error("Invalid network");
    }
  }

  static getBridgeEVMAddress(network: string): string {
    switch (network) {
      case MilkomedaNetworkName.C1Mainnet:
        throw new Error("Need to add Bridge API URL for C1 Mainnet");
      case MilkomedaNetworkName.C1Devnet:
        return "0x319f10d19e21188ecf58b9a146ab0b2bfc894648";
      case MilkomedaNetworkName.A1Mainnet:
        throw new Error("Need to add Bridge API URL for A1 Mainnet");
      case MilkomedaNetworkName.A1Devnet:
        throw new Error("Need to add Bridge API URL for A1 Devnet");
      default:
        throw new Error("Invalid network");
    }
  }
}

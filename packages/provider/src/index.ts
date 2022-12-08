import Provider from "./provider";
import type { CardanoProvider, MilkomedaProvider } from "./types";

declare global {
  interface Window {
    ethereum: MilkomedaProvider | undefined;
    cardano: CardanoProvider | undefined;
  }
}

export const inject = (oracleUrl: string, jsonRpcProviderUrl) => {
  window.ethereum = new Provider(oracleUrl, jsonRpcProviderUrl);

  return window.ethereum;
};

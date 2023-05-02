import Provider, { PROVIDER_TYPES } from "./provider";
import type { CardanoProvider, MilkomedaProvider } from "./types";

declare global {
  interface Window {
    ethereum: MilkomedaProvider | undefined;
    cardano: CardanoProvider | undefined;
  }
}

export const injectCardano = (oracleUrl: string, jsonRpcProviderUrl: string) => {
  window.ethereum = new Provider(oracleUrl, jsonRpcProviderUrl, PROVIDER_TYPES.CARDANO);

  return window.ethereum;
};

export const injectAlgorand = (oracleUrl: string, jsonRpcProviderUrl: string) => {
  window.ethereum = new Provider(oracleUrl, jsonRpcProviderUrl, PROVIDER_TYPES.ALGORAND);

  return window.ethereum;
};

export type { CardanoProvider, MilkomedaProvider };
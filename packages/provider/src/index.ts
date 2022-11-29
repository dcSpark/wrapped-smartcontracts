import Provider from "./provider";
import { CardanoProvider, MilkomedaProvider } from "./types";

declare global {
  interface Window {
    ethereum: MilkomedaProvider | undefined;
    cardano: CardanoProvider | undefined;
  }
}

export const inject = (oracleUrl: string) => {
  // will be fetched from the client
  const actorFactoryAddress = "0x0000000000000000000000000000000000000000";

  window.ethereum = new Provider(oracleUrl, actorFactoryAddress);
};

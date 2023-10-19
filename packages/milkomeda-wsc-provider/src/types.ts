import type { PeraWalletConnect } from "@perawallet/connect";

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[];
}

export interface CardanoProvider {
  getNetworkId(): Promise<number>;
  getUtxos(): Promise<string[] | undefined>;
  getBalance(): Promise<string>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getRewardAddresses(): Promise<string[]>;
  getCollateral(): Promise<string[]>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(tx: string): Promise<string>;
  isEnabled(): Promise<boolean>;
  enable(): Promise<CardanoProvider>;
  signData(addr: string, payload: string): Promise<{ key: string; signature: string }>;
}

export interface EthereumProvider extends NodeJS.EventEmitter {
  request(payload: RequestArguments): Promise<unknown>;
}

export interface MilkomedaProvider extends EthereumProvider {
  isMilkomeda: boolean;
  actorVersion: number | undefined;
  actorFactoryAddress: string | undefined;
  peraWallet: PeraWalletConnect | undefined;
  algorandAccounts: string[];
  setup(actorVersion?: number): Promise<void>;
  changeActorVersion(actorVersion: number): Promise<void>;
  oracleRequest<T>(payload: RequestArguments): Promise<T>;
  providerRequest<T>(payload: RequestArguments): Promise<T>;
}

export type CustomMethod = (
  provider: MilkomedaProvider,
  payload: RequestArguments
) => Promise<unknown>;

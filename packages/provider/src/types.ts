export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[];
}

export interface CardanoProvider {
  isEnabled(): Promise<boolean>;
  enable(): Promise<CardanoProvider>;
  getChangeAddress(): Promise<string>;
  signData(addr: string, payload: string): Promise<{ key: string; signature: string }>;
}

export interface EthereumProvider extends NodeJS.EventEmitter {
  request(payload: RequestArguments): Promise<unknown>;
}

export interface MilkomedaProvider extends EthereumProvider {
  isMilkomeda: boolean;
  cardanoProvider: CardanoProvider;
  actorFactoryAddress: string | undefined;
  setup(): Promise<void>;
  oracleRequest<T>(payload: RequestArguments): Promise<T>;
  providerRequest<T>(payload: RequestArguments): Promise<T>;
}

export type CustomMethod = (
  provider: MilkomedaProvider,
  payload: RequestArguments
) => Promise<unknown>;

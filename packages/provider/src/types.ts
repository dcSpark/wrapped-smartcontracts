export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface CardanoProvider {
  isEnabled(): Promise<boolean>;
  enable(): Promise<CardanoProvider>;
  getChangeAddress(): Promise<string>;
}

export interface MilkomedaProvider {
  isMilkomeda: boolean;
  cardanoProvider: CardanoProvider | undefined;
  actorFactoryAddress: string;
  request(payload: RequestArguments): Promise<unknown>;
}

export type CustomMethod = (
  provider: MilkomedaProvider,
  payload: RequestArguments
) => Promise<unknown>;

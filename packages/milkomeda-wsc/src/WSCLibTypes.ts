import { CardanoAmount } from "./CardanoPendingManger";

export interface IPendingManager {
  getPendingTransactions(): Promise<PendingTx[]>;
}

export interface EVMTokenBalance {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
  type: string;
}

export interface TransactionResponse {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  txreceipt_status: string;
}

export interface AddressResponse {
  address: string;
  amount: CardanoAmount[];
  stake_address: string;
  type: string;
  script: boolean;
}

export interface PendingTx {
  hash: string;
  timestamp: number;
  explorer: string | undefined;
  type: PendingTxType;
  destinationAddress: string;
}

export enum PendingTxType {
  Wrap = "Wrap",
  WrapPermission = "WrapPermission",
  Unwrap = "Unwrap",
  Normal = "Normal",
}

export enum MilkomedaNetworkName {
  C1Mainnet = "Cardano C1 Mainnet",
  C1Devnet = "Cardano C1 Devnet",
  A1Mainnet = "Algorand A1 Mainnet",
  A1Devnet = "Algorand A1 Devnet",
}

export enum UserWallet {
  Flint = "Flint",
  PeraWallet = "PeraWallet",
}

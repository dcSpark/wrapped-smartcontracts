import { OriginAmount } from "./CardanoPendingManger";

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
  amount: OriginAmount[];
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

export interface MempoolPendingTx {
  hash: string;
  type: PendingTxType;
}

export enum PendingTxType {
  Wrap = "Wrap",
  Unwrap = "Unwrap",
  UnwrapPermission = "UnwrapPermission",
  Normal = "Normal",
}

export enum MilkomedaNetworkName {
  C1Mainnet = "Cardano C1 Mainnet",
  C1Devnet = "Cardano C1 Devnet",
  A1Mainnet = "Algorand A1 Mainnet",
  A1Devnet = "Algorand A1 Devnet",
}

export enum TxOriginSource {
  Cardano = "Cardano",
  Algorand = "Algorand",
  Milkomeda = "Milkomeda",
}

export enum TxPendingStatus {
  WaitingL1Confirmation = "WaitingL1Confirmation",
  WaitingBridgeConfirmation = "WaitingBridgeConfirmation",
  WaitingL2Confirmation = "WaitingL2Confirmation",
  Confirmed = "Confirmed",
}

// Algorand
export interface AlgoSchema {
  "num-byte-slice": number;
  "num-uint": number;
}

export interface AlgoAsset {
  amount: number;
  "asset-id": number;
  decimals: number;
  "unit-name": string;
  "is-frozen": boolean;
}

export interface AlgoAccountInfo {
  address: string;
  amount: number;
  "amount-without-pending-rewards": number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "apps-local-state": any[];
  "apps-total-schema": AlgoSchema;
  assets: AlgoAsset[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "created-apps": any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "created-assets": any[];
  "min-balance": number;
  "pending-rewards": number;
  "reward-base": number;
  rewards: number;
  round: number;
  status: string;
  "total-apps-opted-in": number;
  "total-assets-opted-in": number;
  "total-created-apps": number;
  "total-created-assets": number;
}

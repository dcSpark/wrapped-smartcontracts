import { TxPendingStatus } from "milkomeda-wsc";

export const BRIDGE_FEE = 1.1;
export const LOCK_ADA = 3;
export const EVM_ESTIMATED_FEE = 0.1;

export const DEFAULT_SYMBOL = "TADA";
export const LOVELACE_UNIT = "lovelace";

export const BRIDGE_EXPLORER_URL = "https://bridge-explorer.milkomeda.com/cardano-devnet";
export const EVM_EXPLORER_URL = "https://explorer-devnet-cardano-evm.c1.milkomeda.com";

export const TX_STATUS_CHECK_INTERVAL = 5000;

export const TxStatus = {
  ...TxPendingStatus,
  Idle: "Idle" as const,
  Init: "Init" as const,
  Pending: "Pending" as const,
  Error: "Error" as const,
};

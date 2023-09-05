import { TxPendingStatus } from "milkomeda-wsc";

export const BRIDGE_FEE = 1.1;
export const LOCK_ADA = 3;
export const EVM_ESTIMATED_FEE = 0.1;

export const LOVELACE_UNIT = "lovelace";

export const TX_STATUS_CHECK_INTERVAL = 12000;

export const TxStatus = {
  ...TxPendingStatus,
  Idle: "Idle" as const,
  Init: "Init" as const,
  Pending: "Pending" as const,
  Error: "Error" as const,
};

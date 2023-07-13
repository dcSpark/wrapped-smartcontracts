import { TxStatus } from "../constants/transaction";
import React from "react";

export const useTransactionStatus = () => {
  const [txStatus, setTxStatus] = React.useState<keyof typeof TxStatus>(TxStatus.Idle);
  const [txStatusError, setTxStatusError] = React.useState<string | null>(null);

  const isIdle = txStatus === TxStatus.Idle;
  const isLoading =
    txStatus === TxStatus.Init ||
    txStatus === TxStatus.Pending ||
    txStatus === TxStatus.WaitingL1Confirmation ||
    txStatus === TxStatus.WaitingBridgeConfirmation ||
    txStatus === TxStatus.WaitingL2Confirmation;
  const isError = txStatus === TxStatus.Error;
  const isSuccess = txStatus === TxStatus.Confirmed;

  return {
    txStatus,
    txStatusError,
    setTxStatusError,
    setTxStatus,
    isIdle,
    isLoading,
    isError,
    isSuccess,
  };
};

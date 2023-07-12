import React, { useEffect } from "react";
import {
  BalancesWrapper,
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
} from "./styles";
import Button from "../Common/Button";
import { useContext } from "../ConnectWSC";
import useInterval from "../../hooks/useInterval";
import { LabelWithBalance, SuccessMessage, TxStatus } from "./WrapStep";
import BigNumber from "bignumber.js";
import { convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { Spinner } from "../Common/Spinner";
import { EVMTokenBalance, TxPendingStatus } from "milkomeda-wsc";
import {
  BRIDGE_EXPLORER_URL,
  DEFAULT_SYMBOL,
  LOCK_ADA,
  TX_STATUS_CHECK_INTERVAL,
} from "../../constants/transactionFees";

const statusUnwrapMessages = {
  [TxStatus.Init]: "Confirm Unwrapping",
  [TxStatus.Pending]: "Unwrapping your token",
  [TxStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [TxStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [TxStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [TxStatus.Confirmed]: "Your asset has been successfully unwrapped.",
};

const UnwrapStep = ({ nextStep }) => {
  const { wscProvider, tokens, stargateInfo, evmTokenAddress } = useContext();
  const [selectedUnwrapToken, setSelectedUnwrapToken] = React.useState<EVMTokenBalance | null>(
    null
  );
  const [txHash, setTxHash] = React.useState<string | undefined>();

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

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
    },
    txHash != null && txStatus !== TxStatus.Confirmed ? TX_STATUS_CHECK_INTERVAL : null
  );

  useEffect(() => {
    const selectedToken = tokens.find((t) => t.contractAddress === evmTokenAddress);
    if (!selectedToken) return;
    setSelectedUnwrapToken(selectedToken);
  }, [tokens, evmTokenAddress]);

  const unwrapToken = async () => {
    if (!selectedUnwrapToken || !wscProvider) return;
    setTxStatus(TxStatus.Init);

    try {
      const txHash = await wscProvider.unwrap(
        undefined,
        selectedUnwrapToken.contractAddress,
        new BigNumber(selectedUnwrapToken.balance)
      );
      setTxHash(txHash);
      setTxStatus(TxStatus.Pending);
    } catch (err) {
      console.error(err);
      setTxStatus(TxStatus.Error);
      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const fee =
    stargateInfo != null ? new BigNumber(stargateInfo?.stargateNativeTokenFeeToL1) : null;

  return (
    <>
      <StepLargeHeight>
        <StepTitle>Unwrap Tokens: Liberating Assets from Wrapper Chains</StepTitle>
        <StepDescription>
          Non enim praesent elementum facilisis leo vel fringilla. Convallis convallis tellus id
          interdum velit laoreet.
        </StepDescription>
        <BalancesWrapper>
          <LabelWithBalance
            label="You'll transfer:"
            amount={
              selectedUnwrapToken?.balance &&
              convertWeiToTokens({
                valueWei: selectedUnwrapToken?.balance,
                token: selectedUnwrapToken,
              }).toFixed()
            }
            assetName={selectedUnwrapToken?.symbol}
          />
          <LabelWithBalance label="" amount={LOCK_ADA} assetName={DEFAULT_SYMBOL} />
        </BalancesWrapper>

        {isLoading && (
          <>
            <SpinnerWrapper>
              <Spinner />
              <span>{statusUnwrapMessages[txStatus]}</span>
            </SpinnerWrapper>
            <p>Unwrapping transaction may take a few minutes (~2m).</p>
          </>
        )}
        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
          </ErrorMessage>
        )}

        {isSuccess && (
          <>
            <SuccessMessage
              message={statusUnwrapMessages[TxPendingStatus.Confirmed]}
              href={`${BRIDGE_EXPLORER_URL}/search/tx?query=${txHash}`}
            />
            <Button variant="primary" onClick={nextStep}>
              Finish
            </Button>
          </>
        )}
      </StepLargeHeight>
      {(isIdle || isError) && (
        <Button variant="primary" onClick={unwrapToken} disabled={!selectedUnwrapToken}>
          Confirm Unwrapping
        </Button>
      )}
    </>
  );
};

export default UnwrapStep;

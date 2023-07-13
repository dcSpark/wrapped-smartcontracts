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
import { LabelWithBalance, SuccessMessage } from "./WrapStep";
import BigNumber from "bignumber.js";
import { convertTokensToWei, convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { Spinner } from "../Common/Spinner";
import { EVMTokenBalance, TxPendingStatus } from "milkomeda-wsc";
import {
  BRIDGE_EXPLORER_URL,
  DEFAULT_SYMBOL,
  LOCK_ADA,
  TX_STATUS_CHECK_INTERVAL,
  TxStatus,
} from "../../constants/transaction";
import { OrDivider } from "../Common/Modal";
import { useTransactionFees } from "../../hooks/useTransactionFees";
import { useTransactionStatus } from "../../hooks/useTransactionStatus";
import { SuccessStep } from "./index";

const statusUnwrapMessages = {
  [TxStatus.Init]: "Confirm Unwrapping",
  [TxStatus.Pending]: "Unwrapping your token",
  [TxStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [TxStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [TxStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [TxStatus.Confirmed]: "Your asset has been successfully unwrapped.",
};

const UnwrapStep = ({ onFinish, resetSteps }) => {
  const { wscProvider, stepTxDirection, destinationBalance, tokens, evmTokenAddress, setOpen } =
    useContext();
  const [selectedUnwrapToken, setSelectedUnwrapToken] = React.useState<EVMTokenBalance | null>(
    null
  );
  const [txHash, setTxHash] = React.useState<string | undefined>();
  const { unwrappingFee } = useTransactionFees();

  const {
    txStatus,
    txStatusError,
    setTxStatusError,
    setTxStatus,
    isIdle,
    isLoading,
    isError,
    isSuccess,
  } = useTransactionStatus();

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
      if (response === TxStatus.Confirmed) {
        onFinish();
        return;
      }
    },
    txHash != null && txStatus !== TxStatus.Confirmed ? TX_STATUS_CHECK_INTERVAL : null
  );

  useEffect(() => {
    const selectedToken = tokens.find((t) => t.contractAddress === evmTokenAddress) ?? {
      balance: "0",
      contractAddress: evmTokenAddress,
      decimals: evmTokenAddress === "" ? "18" : "0",
      name: "",
      symbol: "",
      type: "string",
    };

    setSelectedUnwrapToken(selectedToken);
  }, [tokens, evmTokenAddress]);

  const unwrapToken = async () => {
    if (!selectedUnwrapToken || !wscProvider || !destinationBalance) return;
    setTxStatus(TxStatus.Init);

    const unwrapOptions = {
      destination: undefined,
      assetId: evmTokenAddress,
      amount:
        stepTxDirection === "buy"
          ? new BigNumber(selectedUnwrapToken.balance)
          : convertTokensToWei({
              value: new BigNumber(destinationBalance).dp(6).toFixed(),
              token: { decimals: 18 },
            }),
    };

    try {
      const txHash = await wscProvider.unwrap(
        unwrapOptions.destination,
        unwrapOptions.assetId,
        unwrapOptions.amount
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

  return (
    <>
      <StepLargeHeight>
        {!isSuccess && (
          <>
            <StepTitle>Unwrapping</StepTitle>
            <StepDescription>
              Initiate the unwrapping process to retrieve your assets. Wrapped Smart Contracts will
              seamlessly interact with the Milkomeda Bridge. Once bridge confirmations are
              complete, your assets will be securely returned to your Mainchain wallet.
            </StepDescription>
            <BalancesWrapper>
              <LabelWithBalance
                label="Bridge fees:"
                amount={unwrappingFee?.toFixed()}
                assetName={DEFAULT_SYMBOL}
                tooltipMessage="This fee is paid to the bridge for unwrapping your token."
              />
              <OrDivider />

              {stepTxDirection === "buy" ? (
                <>
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
                </>
              ) : (
                <LabelWithBalance
                  label="You'll transfer:"
                  amount={destinationBalance && new BigNumber(destinationBalance).dp(6).toFixed()}
                  assetName={DEFAULT_SYMBOL}
                  tooltipMessage={`Note that we'll wrap your entire ${DEFAULT_SYMBOL} balance. If you want to unwrap a different amount, please visit our unwrapping dapp`}
                />
              )}
            </BalancesWrapper>
          </>
        )}

        {isLoading && (
          <>
            <SpinnerWrapper>
              <Spinner />
              <span>{statusUnwrapMessages[txStatus]}</span>
            </SpinnerWrapper>
            <p>Unwrapping transaction may take a few minutes (~3m).</p>
          </>
        )}
        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
          </ErrorMessage>
        )}

        {isSuccess && (
          <>
            <SuccessStep />
            <SuccessMessage
              message={statusUnwrapMessages[TxPendingStatus.Confirmed]}
              href={`${BRIDGE_EXPLORER_URL}/search/tx?query=${txHash}`}
              viewLabel="Milkomeda Bridge Explorer"
            />
            <Button
              variant="primary"
              onClick={() => {
                setOpen(false);
                resetSteps();
              }}
            >
              Close
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

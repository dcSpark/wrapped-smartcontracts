import React, { useEffect } from "react";
import {
  BalancesWrapper,
  ErrorMessage,
  LabelText,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
  TransactionExternalLink,
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
  LOVELACE_UNIT,
  TX_STATUS_CHECK_INTERVAL,
  TxStatus,
} from "../../constants/transaction";
import { OrDivider } from "../Common/Modal";
import { useTransactionFees } from "../../hooks/useTransactionFees";
import { useTransactionStatus } from "../../hooks/useTransactionStatus";
import { SuccessStep } from "./index";
import Alert from "../Common/Alert";
import { AlertTriangleIcon } from "lucide-react";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";

const statusUnwrapMessages = {
  [TxStatus.Init]: "Confirm Unwrapping",
  [TxStatus.Pending]: "Unwrapping your token",
  [TxStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [TxStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [TxStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [TxStatus.Confirmed]: "Your asset has been successfully unwrapped.",
};

const UnwrapStep = ({ onFinish, resetSteps }) => {
  const { wscProvider, tokens, setOpen } = useContext();
  const {
    options: { defaultUnwrapToken, defaultWrapToken },
  } = useTransactionConfigWSC();

  const isWrappingNativeTokenFirst = defaultWrapToken.unit === LOVELACE_UNIT;

  const [selectedUnwrapToken, setSelectedUnwrapToken] = React.useState<EVMTokenBalance | null>(
    null
  );
  const [txHash, setTxHash] = React.useState<string | undefined>();
  const { unwrappingFee, adaLocked } = useTransactionFees();

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
    const selectedToken = tokens.find((t) => t.contractAddress === defaultUnwrapToken.unit) ?? {
      balance: "0",
      contractAddress: isWrappingNativeTokenFirst ? defaultUnwrapToken.unit : "",
      decimals: isWrappingNativeTokenFirst ? "0" : "18",
      name: "",
      symbol: DEFAULT_SYMBOL,
      type: "string",
    };

    const defaultToken = {
      ...selectedToken,
      balance: isWrappingNativeTokenFirst
        ? new BigNumber(defaultUnwrapToken.amount).toString()
        : convertWeiToTokens({
            valueWei: defaultUnwrapToken.amount,
            token: { decimals: 18 },
          })
            .dp(6)
            .toFixed(),
    };

    setSelectedUnwrapToken(defaultToken);
  }, [tokens, defaultUnwrapToken.unit]);

  const unwrapToken = async () => {
    if (!selectedUnwrapToken || !wscProvider || !unwrappingFee) return;
    setTxStatus(TxStatus.Init);

    const unwrapOptions = {
      destination: undefined,
      assetId: isWrappingNativeTokenFirst ? selectedUnwrapToken.contractAddress : undefined,
      amount: isWrappingNativeTokenFirst
        ? new BigNumber(defaultUnwrapToken.amount)
        : convertTokensToWei({
            value: selectedUnwrapToken.balance,
            token: { decimals: 6 },
          })
            .plus(adaLocked.multipliedBy(10 ** 6))
            .plus(unwrappingFee?.multipliedBy(10 ** 6)),
    };

    try {
      const txHash = await wscProvider.unwrap(
        unwrapOptions.destination,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        unwrapOptions.assetId!,
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
            {!isLoading && (
              <BalancesWrapper>
                {isWrappingNativeTokenFirst ? (
                  <LabelWithBalance
                    label="Bridge Lock-up:"
                    amount={LOCK_ADA}
                    assetName={DEFAULT_SYMBOL}
                  />
                ) : (
                  <>
                    <LabelWithBalance
                      label="Received:"
                      amount={
                        selectedUnwrapToken &&
                        convertTokensToWei({
                          value: selectedUnwrapToken.balance,
                          token: { decimals: 6 },
                        })
                          .dividedBy(10 ** 6)
                          .toFixed()
                      }
                      assetName={DEFAULT_SYMBOL}
                    />
                    <LabelWithBalance
                      label="Bridge Lock-up:"
                      amount={LOCK_ADA}
                      assetName={DEFAULT_SYMBOL}
                    />
                    <LabelWithBalance
                      label="Bridge fees:"
                      amount={unwrappingFee?.toFixed()}
                      assetName={unwrappingFee && DEFAULT_SYMBOL}
                      tooltipMessage="This fee is paid to the bridge for unwrapping your token."
                    />
                  </>
                )}

                {isWrappingNativeTokenFirst ? (
                  <>
                    <OrDivider />
                    <LabelText style={{ alignSelf: "center" }}>You'll transfer</LabelText>
                    <LabelWithBalance
                      label="Token:"
                      amount={
                        selectedUnwrapToken?.balance &&
                        convertWeiToTokens({
                          valueWei: selectedUnwrapToken.balance,
                          token: selectedUnwrapToken,
                        }).toFixed()
                      }
                      assetName={unwrappingFee && selectedUnwrapToken?.symbol}
                    />
                    <LabelWithBalance label="ADA:" amount={LOCK_ADA} assetName={DEFAULT_SYMBOL} />
                  </>
                ) : (
                  <>
                    <OrDivider />
                    <LabelWithBalance
                      label="You'll transfer:"
                      amount={
                        selectedUnwrapToken &&
                        unwrappingFee &&
                        convertTokensToWei({
                          value: selectedUnwrapToken.balance,
                          token: { decimals: 6 },
                        })
                          .plus(adaLocked.multipliedBy(10 ** 6))
                          .plus(unwrappingFee?.multipliedBy(10 ** 6))
                          .dividedBy(10 ** 6)
                          .toFixed()
                      }
                      assetName={DEFAULT_SYMBOL}
                    />
                  </>
                )}
              </BalancesWrapper>
            )}
          </>
        )}

        {isLoading && (
          <>
            <SpinnerWrapper>
              <Spinner />
              <span>{statusUnwrapMessages[txStatus]}</span>
            </SpinnerWrapper>
            <p style={{ marginBottom: 30 }}>
              Unwrapping transaction may take a few minutes (~3m).
            </p>
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
        {txHash && txStatus === TxStatus.WaitingBridgeConfirmation && (
          <>
            <Alert icon={<AlertTriangleIcon />}>
              <span>
                If your transaction is taking longer to process, you can check its status{" "}
              </span>
              <TransactionExternalLink
                style={{ display: "inline" }}
                target="_blank"
                rel="noopener noreferrer"
                href={`${BRIDGE_EXPLORER_URL}/search/tx?query=${txHash}`}
              >
                here in the Milkomeda Bridge Explorer.
              </TransactionExternalLink>{" "}
              You may proceed to close this modal and continue using the app.
            </Alert>

            <Button
              style={{ marginTop: 40 }}
              variant="primary"
              onClick={() => {
                resetSteps();
                setOpen(false);
              }}
            >
              Continue using the app
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

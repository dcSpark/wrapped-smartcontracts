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
import { useContext } from "../ConnectWSC";
import useInterval from "../../hooks/useInterval";
import { LabelWithBalance, SuccessMessage } from "./WrapStep";
import BigNumber from "bignumber.js";
import { convertTokensToWei, convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { Spinner } from "../Common/Spinner";
import { EVMTokenBalance, TxPendingStatus } from "milkomeda-wsc";
import {
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
import { useNetwork } from "wagmi";
import { getBridgeExplorerUrl, getDefaultTokenByChainId } from "../../utils/transactions";
import Button from "../Common/Button";
import { useGetDestinationBalance, useGetWSCTokens } from "../../hooks/wsc-provider";
import invariant from "tiny-invariant";

export const statusUnwrapMessages = {
  [TxStatus.Init]: "Confirm Unwrapping",
  [TxStatus.Pending]: "Unwrapping your token",
  [TxStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [TxStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [TxStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [TxStatus.Confirmed]: "Your asset has been successfully unwrapped.",
};

const UnwrapStep = ({ onFinish, resetSteps }) => {
  const { wscProvider, setOpen } = useContext();
  const { isSuccess: isTokensSuccess, tokens } = useGetWSCTokens();
  const { destinationBalance } = useGetDestinationBalance();
  const {
    options: { defaultWrapToken, evmTokenAddress },
  } = useTransactionConfigWSC();
  const { chain } = useNetwork();
  const defaultSymbol = getDefaultTokenByChainId(chain?.id);

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
    if (isTokensSuccess) {
      const selectedToken = isWrappingNativeTokenFirst
        ? tokens.find((t) => t.contractAddress.toLowerCase() === evmTokenAddress.toLowerCase())
        : {
            balance: "0",
            contractAddress: "",
            decimals: "18",
            name: "",
            symbol: defaultSymbol,
            type: "",
          };

      invariant(selectedToken, "default unwrap token not found");

      const defaultToken = {
        ...selectedToken,
        balance: isWrappingNativeTokenFirst
          ? new BigNumber(selectedToken.balance).toString() // unscaled
          : convertTokensToWei({
              value: new BigNumber(destinationBalance ?? 0).dp(6),
              token: { decimals: 6 },
            }).toFixed(), // unscaled
      };

      setSelectedUnwrapToken(defaultToken);
    }
  }, [tokens, evmTokenAddress, destinationBalance]);

  const unwrapToken = async () => {
    if (!selectedUnwrapToken || !wscProvider || !unwrappingFee) return;
    setTxStatus(TxStatus.Init);

    const unwrapOptions = {
      destination: undefined,
      assetId: isWrappingNativeTokenFirst ? selectedUnwrapToken.contractAddress : undefined,
      amount: new BigNumber(selectedUnwrapToken.balance),
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
                    assetName={defaultSymbol}
                  />
                ) : (
                  <>
                    <LabelWithBalance
                      label="Received:"
                      amount={
                        selectedUnwrapToken &&
                        unwrappingFee &&
                        new BigNumber(selectedUnwrapToken.balance)
                          .minus(adaLocked.multipliedBy(10 ** 6))
                          .plus(unwrappingFee?.multipliedBy(10 ** 6))
                          .dividedBy(10 ** 6)
                          .toFixed()
                      }
                      assetName={defaultSymbol}
                    />
                    <LabelWithBalance
                      label="Bridge Lock-up:"
                      amount={LOCK_ADA}
                      assetName={defaultSymbol}
                    />
                    <LabelWithBalance
                      label="Bridge fees:"
                      amount={unwrappingFee?.toFixed()}
                      assetName={unwrappingFee && defaultSymbol}
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
                    <LabelWithBalance label="ADA:" amount={LOCK_ADA} assetName={defaultSymbol} />
                  </>
                ) : (
                  <>
                    <OrDivider />
                    <LabelWithBalance
                      label="You'll transfer:"
                      amount={
                        selectedUnwrapToken &&
                        convertWeiToTokens({
                          valueWei: selectedUnwrapToken.balance,
                          token: { decimals: 6 },
                        }).toFixed()
                      }
                      assetName={defaultSymbol}
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
            <p style={{ marginBottom: 30, fontSize: "0.875rem" }}>
              Unwrapping transaction may take a few minutes (~10 minutes).
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
              href={`${getBridgeExplorerUrl(chain?.id)}/search/tx?query=${txHash}`}
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
                href={`${getBridgeExplorerUrl(chain?.id)}/search/tx?query=${txHash}`}
              >
                here in the Milkomeda Bridge Explorer.
              </TransactionExternalLink>{" "}
              You may proceed to close this modal and continue using the app.
            </Alert>

            <Button
              onClick={() => {
                resetSteps();
                setOpen(false);
              }}
              style={{ marginTop: 40 }}
              variant="primary"
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

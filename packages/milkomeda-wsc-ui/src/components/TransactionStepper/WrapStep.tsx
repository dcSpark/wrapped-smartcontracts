import { useContext } from "../ConnectWSC";
import React from "react";
import { convertTokensToWei, convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { AnimatePresence } from "framer-motion";
import { Balance, BalanceContainer, LoadingBalance } from "../Pages/Profile/styles";
import BigNumber from "bignumber.js";
import {
  ErrorMessage,
  LabelText,
  LabelWithBalanceContainer,
  SpinnerWrapper,
  StepLargeHeight,
  StepTitle,
  SuccessWrapper,
  SuccessWrapperMessage,
  TransactionExternalLink,
  WrapperButtons,
} from "./styles";
import Button from "../Common/Button";
import { TxPendingStatus } from "milkomeda-wsc";
import { Spinner } from "../Common/Spinner";
import useInterval from "../../hooks/useInterval";
import { CheckCircle2, LucideInfo } from "lucide-react";

import { OriginAmount } from "milkomeda-wsc/build/CardanoPendingManger";
import Tooltip from "../Common/Tooltip";
import { BRIDGE_EXPLORER_URL, TX_STATUS_CHECK_INTERVAL } from "../../constants/transactionFees";
import Overview from "../Pages/Overview";
import { useTransactionFees } from "../../hooks/useTransactionFees";
import { ExternalLinkIcon } from "../../assets/icons";

export type WrapToken = Omit<OriginAmount, "quantity"> & {
  quantity: BigNumber;
};

export const TxStatus = {
  ...TxPendingStatus,
  Idle: "Idle" as const,
  Init: "Init" as const,
  Pending: "Pending" as const,
  Error: "Error" as const,
};

const statusWrapMessages = {
  [TxStatus.Init]: "Confirm Wrapping",
  [TxStatus.Pending]: "Wrapping your token",
  [TxStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [TxStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [TxStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [TxStatus.Confirmed]: "Your asset has been successfully wrapped.",
};

export const useSelectedWrapToken = () => {
  const { originTokens } = useContext();
  const { defaultCardanoAsset } = useContext();

  const [selectedWrapToken, setSelectedWrapToken] = React.useState<WrapToken | null>(null);

  React.useEffect(() => {
    if (!defaultCardanoAsset) return;
    const loadOriginToken = async () => {
      const token = originTokens.find((t) => t.unit === defaultCardanoAsset.unit);
      if (!token) return;
      const defaultToken = {
        ...token,
        quantity: convertWeiToTokens({ valueWei: token.quantity, token }),
      };
      setSelectedWrapToken(defaultToken);
    };
    loadOriginToken();
  }, [defaultCardanoAsset?.amount, defaultCardanoAsset?.unit, originTokens, setSelectedWrapToken]);

  return { selectedWrapToken };
};

const WrapStep = ({ nextStep }) => {
  const { setOpen, defaultCardanoAsset } = useContext();
  const { wscProvider } = useContext();
  const { selectedWrapToken } = useSelectedWrapToken();
  const { wrappingFee, adaLocked } = useTransactionFees();
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

  const wrapToken = async () => {
    if (!selectedWrapToken || !defaultCardanoAsset) return;
    setTxStatus(TxStatus.Init);

    try {
      const wrapAmount =
        defaultCardanoAsset?.unit === "lovelace"
          ? convertTokensToWei({
              value: defaultCardanoAsset?.amount / 10 ** 18, // unscaled value
              token: { decimals: 6 },
            }).plus(+adaLocked * 10 ** 6) // ADA LOCKED in lovelace
          : new BigNumber(defaultCardanoAsset?.amount);

      const txHash = await wscProvider?.wrap(
        undefined,
        selectedWrapToken.unit,
        wrapAmount.toNumber()
      );
      setTxHash(txHash);
      setTxStatus(TxStatus.Pending);
    } catch (err) {
      setTxStatus(TxStatus.Error);

      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const formattedAmount =
    defaultCardanoAsset != null &&
    selectedWrapToken != null &&
    convertWeiToTokens({
      valueWei: defaultCardanoAsset.amount,
      token: {
        decimals: defaultCardanoAsset.unit === "lovelace" ? 18 : selectedWrapToken.decimals,
      },
    }).dp(2);

  const isAmountValid =
    selectedWrapToken != null &&
    defaultCardanoAsset != null &&
    wrappingFee != null &&
    formattedAmount
      ? formattedAmount.plus(wrappingFee).lte(selectedWrapToken?.quantity)
      : false;

  return (
    <>
      <StepLargeHeight>
        <StepTitle>Wrap Tokens</StepTitle>
        <Overview selectedWrapToken={selectedWrapToken} />
        {isLoading && (
          <>
            <SpinnerWrapper>
              <Spinner />
              <span>{statusWrapMessages[txStatus]}</span>
            </SpinnerWrapper>
            <p>Wrapping transaction may take a few minutes (~3m).</p>
          </>
        )}
        {isSuccess && (
          <>
            <SuccessMessage
              message={statusWrapMessages[TxPendingStatus.Confirmed]}
              href={`${BRIDGE_EXPLORER_URL}/wrap/${txHash}`}
            />
            <Button variant="primary" onClick={nextStep}>
              Continue
            </Button>
          </>
        )}

        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
          </ErrorMessage>
        )}
      </StepLargeHeight>

      {(isIdle || isError) && (
        <WrapperButtons>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={
              selectedWrapToken == null || !selectedWrapToken.bridgeAllowed || !isAmountValid
            }
            onClick={wrapToken}
          >
            Confirm wrapping
          </Button>
        </WrapperButtons>
      )}
    </>
  );
};

export default WrapStep;

export const LabelWithBalance = ({ label, amount, assetName, tooltipMessage = "" }) => {
  return (
    <LabelWithBalanceContainer>
      <LabelText>{label}</LabelText>
      <BalanceContainer>
        <AnimatePresence exitBeforeEnter initial={false}>
          {amount && assetName ? (
            <Balance
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>
                {amount}
                {` `}
                {assetName}
              </span>
              {tooltipMessage ? (
                <Tooltip message={tooltipMessage} xOffset={-6}>
                  <LucideInfo />
                </Tooltip>
              ) : null}
            </Balance>
          ) : (
            <LoadingBalance
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              &nbsp;
            </LoadingBalance>
          )}
        </AnimatePresence>
      </BalanceContainer>
    </LabelWithBalanceContainer>
  );
};

export const SuccessMessage = ({ message, href }: { message: string; href?: string }) => {
  return (
    <SuccessWrapper>
      <CheckCircle2 />
      <SuccessWrapperMessage>
        <p>{message} </p>
        {href && (
          <p>
            {" "}
            View on{" "}
            <TransactionExternalLink target="_blank" rel="noopener noreferrer" href={href}>
              Explorer <ExternalLinkIcon />
            </TransactionExternalLink>
          </p>
        )}
      </SuccessWrapperMessage>
    </SuccessWrapper>
  );
};

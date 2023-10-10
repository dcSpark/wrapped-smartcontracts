import { useContext } from "../ConnectWSC";
import React from "react";
import { convertTokensToWei, convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { AnimatePresence } from "framer-motion";
import { Balance, BalanceContainer, LoadingBalance } from "../Pages/TransactionSteps/styles";
import BigNumber from "bignumber.js";
import {
  ErrorMessage,
  LabelText,
  LabelWithBalanceContainer,
  SpinnerWrapper,
  StepDescription,
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
import { LOVELACE_UNIT, TX_STATUS_CHECK_INTERVAL, TxStatus } from "../../constants/transaction";
import Overview from "../Pages/Overview";
import { useTransactionFees } from "../../hooks/useTransactionFees";
import { ExternalLinkIcon } from "../../assets/icons";
import { useTransactionStatus } from "../../hooks/useTransactionStatus";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import { useNetwork } from "wagmi";
import { getBridgeExplorerUrl, getDefaultTokenByChainId } from "../../utils/transactions";
import { useGetOriginTokens } from "../../hooks/wsc-provider";

export type WrapToken = Omit<OriginAmount, "quantity"> & {
  quantity: BigNumber;
};

export const statusWrapMessages = {
  [TxStatus.Init]: "Confirm Wrapping",
  [TxStatus.Pending]: "Wrapping your token",
  [TxStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [TxStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [TxStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [TxStatus.Confirmed]: "Your asset has been successfully wrapped.",
};

export const useSelectedWrapToken = () => {
  const { originTokens } = useGetOriginTokens();
  const { chain } = useNetwork();
  const {
    options: { defaultWrapToken },
  } = useTransactionConfigWSC();

  const defaultSymbol = getDefaultTokenByChainId(chain?.id);

  const [selectedWrapToken, setSelectedWrapToken] = React.useState<WrapToken | null>(null);

  const adaToken = originTokens.find((t) => t.unit === LOVELACE_UNIT);

  React.useEffect(() => {
    if (!defaultWrapToken) return;
    const loadOriginToken = async () => {
      const token = originTokens.find(
        (t) => t.unit.toLowerCase() === defaultWrapToken.unit.toLowerCase()
      ) ?? {
        unit: LOVELACE_UNIT,
        quantity: "0",
        decimals: defaultWrapToken.unit === LOVELACE_UNIT ? 6 : 0,
        bridgeAllowed: true,
        assetName: defaultSymbol,
        fingerprint: undefined,
      };

      const defaultToken = {
        ...token,
        quantity: convertWeiToTokens({ valueWei: token.quantity, token }),
      };
      setSelectedWrapToken(defaultToken);
    };
    loadOriginToken();
  }, [defaultWrapToken?.amount, defaultWrapToken?.unit, originTokens, setSelectedWrapToken]);

  return { selectedWrapToken, adaToken };
};

const WrapStep = ({ nextStep }) => {
  const { setOpen } = useContext();
  const { wscProvider } = useContext();
  const { chain } = useNetwork();

  const {
    options: { defaultWrapToken },
  } = useTransactionConfigWSC();
  const isWrappingNativeTokenFirst = defaultWrapToken.unit === LOVELACE_UNIT;
  const { selectedWrapToken, adaToken } = useSelectedWrapToken();
  const { wrappingFee, evmEstimatedFee, adaLocked, unwrappingFee, bridgeFees } =
    useTransactionFees();

  if (!defaultWrapToken) {
    throw new Error("please set your default cardano asset");
  }

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
  const [txHash, setTxHash] = React.useState<string | undefined>();

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
    },
    txHash != null && txStatus !== TxStatus.Confirmed ? TX_STATUS_CHECK_INTERVAL : null
  );

  const wrapToken = async () => {
    if (!selectedWrapToken || !unwrappingFee || !defaultWrapToken || !wrappingFee) return;
    setTxStatus(TxStatus.Init);
    const totalFees = adaLocked
      .multipliedBy(10 ** 6) // lovelace ADA LOCKED
      .plus(unwrappingFee.multipliedBy(10 ** 6)) // lovelace unwrapping fee
      .plus(evmEstimatedFee.multipliedBy(10 ** 6)) // lovelace evm fee
      .plus(wrappingFee.multipliedBy(10 ** 6)); // lovelace wrapping fee

    try {
      const wrapAmount =
        defaultWrapToken.unit === LOVELACE_UNIT
          ? convertTokensToWei({
              value: new BigNumber(defaultWrapToken.amount).dividedBy(10 ** 18), // unscaled value
              token: { decimals: 6 },
            })
              .plus(totalFees)
              .minus(wrappingFee.multipliedBy(10 ** 6)) // wrapping fee is already included
              .dp(0, BigNumber.ROUND_UP)
          : new BigNumber(defaultWrapToken.amount);

      const txHash = await wscProvider?.wrap(
        undefined,
        selectedWrapToken.unit,
        wrapAmount.toNumber(),
        defaultWrapToken.unit !== LOVELACE_UNIT ? totalFees.toNumber() : 0
      );
      setTxHash(txHash);
      setTxStatus(TxStatus.Pending);
    } catch (err) {
      setTxStatus(TxStatus.Error);
      console.error(err);

      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const formattedAmount = React.useMemo(() => {
    if (!defaultWrapToken || !selectedWrapToken) return;
    return defaultWrapToken.unit === LOVELACE_UNIT
      ? convertWeiToTokens({
          valueWei: defaultWrapToken.amount,
          token: { decimals: 18 },
        }).dp(2, BigNumber.ROUND_UP)
      : convertWeiToTokens({
          valueWei: defaultWrapToken.amount,
          token: selectedWrapToken,
        });
  }, [defaultWrapToken, selectedWrapToken]);

  const isAmountValid = React.useMemo(() => {
    if (!formattedAmount || !wrappingFee || !bridgeFees || !selectedWrapToken || isLoading) return;
    if (!isWrappingNativeTokenFirst) {
      const adaAmount = convertTokensToWei({
        value: adaToken?.quantity,
        token: { decimals: adaToken?.decimals },
      });
      return (
        bridgeFees.plus(adaLocked).plus(evmEstimatedFee).lte(adaAmount) &&
        formattedAmount.lte(selectedWrapToken.quantity)
      );
    }
    return formattedAmount
      .plus(bridgeFees)
      .plus(+adaLocked)
      .plus(evmEstimatedFee)
      .lte(selectedWrapToken.quantity);
  }, [isWrappingNativeTokenFirst, formattedAmount, wrappingFee, bridgeFees, selectedWrapToken]);

  return (
    <>
      <StepLargeHeight>
        <StepTitle>Wrapping</StepTitle>
        <StepDescription>
          Easily facilitate transactions with Wrapped Smart Contracts by converting your Mainchain
          assets into Milkomeda assets.
        </StepDescription>
        <Overview selectedWrapToken={selectedWrapToken} />

        {selectedWrapToken != null && !selectedWrapToken.bridgeAllowed && (
          <ErrorMessage role="alert">Error: Bridge doesn't allow this token</ErrorMessage>
        )}
        {isIdle && selectedWrapToken != null && isAmountValid === false && (
          <ErrorMessage role="alert">
            Error: Insufficient balance. Please verify you have enough funds to cover the
            transaction.
          </ErrorMessage>
        )}

        {isLoading && (
          <>
            <SpinnerWrapper>
              <Spinner />
              <span>{statusWrapMessages[txStatus]}</span>
            </SpinnerWrapper>
            <p style={{ fontSize: "0.875rem" }}>
              Wrapping transaction may take a few minutes (~5m).
            </p>
          </>
        )}
        {isSuccess && (
          <>
            <SuccessMessage
              message={statusWrapMessages[TxPendingStatus.Confirmed]}
              href={`${getBridgeExplorerUrl(chain?.id)}/wrap/${txHash}`}
              viewLabel="Milkomeda Bridge Explorer"
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
          <Button
            variant="secondary"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={
              selectedWrapToken == null || !selectedWrapToken.bridgeAllowed || !isAmountValid
            }
            onClick={wrapToken}
            variant={"primary"}
          >
            Confirm Wrapping
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

export const SuccessMessage = ({
  message,
  href,
  viewLabel = "Explorer",
  disableGutters = false,
}: {
  message: string;
  href?: string;
  viewLabel?: string;
  disableGutters?: boolean;
}) => {
  return (
    <SuccessWrapper
      {...(disableGutters && {
        style: {
          padding: "10px 0",
        },
      })}
    >
      <CheckCircle2 />
      <SuccessWrapperMessage>
        <span>{message} </span>
        {href && (
          <span>
            {" "}
            View on{" "}
            <TransactionExternalLink target="_blank" rel="noopener noreferrer" href={href}>
              {viewLabel} <ExternalLinkIcon />
            </TransactionExternalLink>
          </span>
        )}
      </SuccessWrapperMessage>
    </SuccessWrapper>
  );
};

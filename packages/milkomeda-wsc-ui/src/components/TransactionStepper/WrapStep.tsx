import { useContext } from "../ConnectWSC";
import React from "react";
import { convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { AnimatePresence } from "framer-motion";
import { Balance, BalanceContainer, LoadingBalance } from "../Pages/Profile/styles";
import BigNumber from "bignumber.js";
import {
  BalancesWrapper,
  ErrorMessage,
  LabelText,
  LabelWithBalanceContainer,
  SpinnerWrapper,
  StepDescription,
  StepTitle,
  SuccessWrapper,
  WrapperButtons,
} from "./styles";
import Button from "../Common/Button";
import { TxPendingStatus } from "milkomeda-wsc";
import { Spinner } from "../Common/Spinner";
import useInterval from "../../hooks/useInterval";
import { BadgeInfoIcon, CheckCircle2, LucideInfo } from "lucide-react";
import { DEFAULT_STEP_TIMEOUT } from "./constants";
import { OriginAmount } from "milkomeda-wsc/build/CardanoPendingManger";
import { OrDivider } from "../Common/Modal";
import { RetryIconCircle } from "../../assets/icons";
import Tooltip from "../Common/Tooltip";
import { states } from "../ConnectModal/ConnectWithInjector";
import { LOCK_ADA } from "../Pages/Overview";

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
  [TxStatus.Confirmed]: "Your asset has been successfully wrapped!",
};

export const defaultSymbol = "TADA";

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
  const { wscProvider, stargateInfo } = useContext();
  const [txHash, setTxHash] = React.useState<string | undefined | null>(null);
  const { selectedWrapToken } = useSelectedWrapToken();
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
      if (response === TxStatus.Confirmed) {
        setTxHash(null);
        setTimeout(() => {
          nextStep();
        }, DEFAULT_STEP_TIMEOUT);
      }
    },
    txHash != null ? 4000 : null
  );

  const wrapToken = async () => {
    if (!selectedWrapToken || !defaultCardanoAsset) return;
    setTxStatus(TxStatus.Init);

    try {
      const wrapAmount = convertWeiToTokens({
        valueWei: defaultCardanoAsset?.amount,
        token: {
          decimals: defaultCardanoAsset?.unit === "lovelace" ? 18 : selectedWrapToken?.decimals,
        },
      }).dp(0, BigNumber.ROUND_UP);

      if (!wrapAmount) {
        throw new Error("Invalid wrap amount");
      }
      const txHash = await wscProvider?.wrap(undefined, selectedWrapToken.unit, +wrapAmount);
      setTxHash(txHash);
      setTxStatus(TxStatus.Pending);
    } catch (err) {
      setTxStatus(TxStatus.Error);
      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const fee =
    stargateInfo != null
      ? convertWeiToTokens({
          valueWei: stargateInfo.fromNativeTokenInLoveLaceOrMicroAlgo,
          token: { decimals: 6 },
        })
      : null;

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
    selectedWrapToken != null && defaultCardanoAsset != null && fee != null && formattedAmount
      ? formattedAmount.plus(fee).lte(selectedWrapToken?.quantity)
      : false;

  const isAboveMinAmount =
    stargateInfo != null &&
    selectedWrapToken != null &&
    defaultCardanoAsset != null &&
    formattedAmount &&
    formattedAmount.gte(stargateInfo?.stargateMinNativeTokenFromL1);

  return (
    <>
      <div>
        <StepTitle>Wrap Tokens</StepTitle>
        <StepDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Condimentum mattis pellentesque id nibh. Facilisis
          mauris sit amet massa vitae tortor condimentum lacinia.
        </StepDescription>
        {selectedWrapToken?.unit === "lovelace" ? (
          <BalancesWrapper>
            <LabelWithBalance
              label="You're moving:"
              amount={defaultCardanoAsset != null && formattedAmount && formattedAmount.toFixed()}
              assetName={selectedWrapToken?.assetName}
            />
            <LabelWithBalance
              label="Wrapping fee:"
              amount={fee?.toFixed()}
              assetName={defaultSymbol}
            />
            <OrDivider />

            <LabelWithBalance
              label="You'll transfer:"
              amount={
                fee &&
                defaultCardanoAsset != null &&
                formattedAmount &&
                formattedAmount.plus(fee).toFixed()
              }
              assetName={selectedWrapToken?.assetName}
            />
          </BalancesWrapper>
        ) : (
          <BalancesWrapper>
            <LabelWithBalance
              label="You'll transfer:"
              amount={defaultCardanoAsset != null && formattedAmount && formattedAmount.toFixed()}
              assetName={selectedWrapToken?.assetName}
            />
            <LabelWithBalance
              label=""
              amount={fee?.plus(new BigNumber(LOCK_ADA))?.toFixed()}
              assetName={defaultSymbol}
            />
          </BalancesWrapper>
        )}

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
          <SuccessWrapper>
            <CheckCircle2 />
            <span>{statusWrapMessages[TxPendingStatus.Confirmed]}</span>
          </SuccessWrapper>
        )}

        {selectedWrapToken != null && !selectedWrapToken.bridgeAllowed && (
          <ErrorMessage role="alert">Error: Bridge doesn't allow this token</ErrorMessage>
        )}
        {selectedWrapToken != null && !isAmountValid && (
          <ErrorMessage role="alert">Error: Amount exceeds your current balance</ErrorMessage>
        )}
        {selectedWrapToken != null &&
          selectedWrapToken.unit === "lovelace" &&
          !isAboveMinAmount && (
            <ErrorMessage role="alert">
              Error: Minimum amount to wrap is {stargateInfo?.stargateMinNativeTokenFromL1}{" "}
              {defaultSymbol}
            </ErrorMessage>
          )}
        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
          </ErrorMessage>
        )}
      </div>

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

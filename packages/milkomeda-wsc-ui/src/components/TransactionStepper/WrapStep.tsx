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
import { CheckCircle2 } from "lucide-react";
import { DEFAULT_STEP_TIMEOUT } from "./constants";

export type WrapToken = {
  assetName: string;
  bridgeAllowed: boolean;
  decimals: number;
  fingerprint: string;
  has_nft_onchain_metadata: boolean;
  quantity: BigNumber;
  unit: string;
};

export const WrapStatus = {
  ...TxPendingStatus,
  Idle: "Idle" as const,
  Init: "Init" as const,
  Pending: "Pending" as const,
  Error: "Error" as const,
};

const statusWrapMessages = {
  [WrapStatus.Init]: "Confirm Wrapping",
  [WrapStatus.Pending]: "Wrapping your token",
  [WrapStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [WrapStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [WrapStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [WrapStatus.Confirmed]: "Your asset has been successfully wrapped!",
};

const WrapStep = ({ nextStep }) => {
  const { setOpen, defaultCardanoAsset } = useContext();
  const [selectedWrapToken, setSelectedWrapToken] = React.useState<WrapToken | null>(null);
  const { wscProvider, originTokens, stargateInfo } = useContext();
  const [txHash, setTxHash] = React.useState<string | undefined | null>(null);

  const [txStatus, setTxStatus] = React.useState<keyof typeof WrapStatus>(WrapStatus.Idle);
  const [txStatusError, setTxStatusError] = React.useState<string | null>(null);
  const isIdle = txStatus === WrapStatus.Idle;
  const isLoading =
    txStatus === WrapStatus.Init ||
    txStatus === WrapStatus.Pending ||
    txStatus === WrapStatus.WaitingL1Confirmation ||
    txStatus === WrapStatus.WaitingBridgeConfirmation ||
    txStatus === WrapStatus.WaitingL2Confirmation;
  const isError = txStatus === WrapStatus.Error;
  const isSuccess = txStatus === WrapStatus.Confirmed;

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
      if (response === TxPendingStatus.Confirmed) {
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
    setTxStatus(WrapStatus.Init);

    try {
      const txHash = await wscProvider?.wrap(
        undefined,
        selectedWrapToken.unit,
        defaultCardanoAsset.amount
      );
      setTxHash(txHash);
      setTxStatus(WrapStatus.Pending);
    } catch (err) {
      setTxStatus(WrapStatus.Error);
      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

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

  const fee =
    stargateInfo != null ? new BigNumber(stargateInfo?.stargateMinNativeTokenFromL1) : null;

  const isAmountValid =
    selectedWrapToken != null && defaultCardanoAsset != null && fee != null
      ? new BigNumber(defaultCardanoAsset.amount).plus(fee).lte(selectedWrapToken?.quantity)
      : false;

  return (
    <div>
      <StepTitle>Wrap Tokens</StepTitle>
      <StepDescription>
        Explore the power of wrap tokens as they seamlessly connect Cardano and Ethereum, enabling
        users to leverage the benefits of both blockchain ecosystems. With wrap tokens, Cardano
        tokens can be wrapped and utilized on the Ethereum network.
      </StepDescription>
      <BalancesWrapper>
        <LabelWithBalance
          label="You're moving:"
          amount={
            defaultCardanoAsset != null && new BigNumber(defaultCardanoAsset.amount).toFixed()
          }
          assetName={selectedWrapToken?.assetName}
        />
        <LabelWithBalance
          label="Wrapping fee:"
          amount={fee?.toFixed()}
          assetName={selectedWrapToken?.assetName}
        />
        <LabelWithBalance
          label="You'll transfer:"
          amount={
            fee &&
            defaultCardanoAsset != null &&
            new BigNumber(defaultCardanoAsset.amount).plus(fee).toFixed()
          }
          assetName={selectedWrapToken?.assetName}
        />
      </BalancesWrapper>

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
      {isError && (
        <ErrorMessage role="alert">
          Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
        </ErrorMessage>
      )}

      {(isIdle || isError) && (
        <WrapperButtons>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={wrapToken}>
            Confirm wrapping
          </Button>
        </WrapperButtons>
      )}
    </div>
  );
};

export default WrapStep;

export const LabelWithBalance = ({ label, amount, assetName }) => {
  return (
    <LabelWithBalanceContainer>
      <LabelText>{label} </LabelText>
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

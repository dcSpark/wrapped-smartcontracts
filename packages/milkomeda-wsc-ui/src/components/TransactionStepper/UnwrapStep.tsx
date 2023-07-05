import React, { useEffect } from "react";
import {
  BalancesWrapper,
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepTitle,
  SuccessWrapper,
} from "./styles";
import Button from "../Common/Button";
import { useContext } from "../ConnectWSC";
import useInterval from "../../hooks/useInterval";
import { LabelWithBalance, WrapStatus } from "./WrapStep";
import BigNumber from "bignumber.js";
import { convertTokensToWei, convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { Spinner } from "../Common/Spinner";
import { CheckCircle2 } from "lucide-react";
import { TxPendingStatus } from "milkomeda-wsc";
import { DEFAULT_STEP_TIMEOUT } from "./constants";

const statusUnwrapMessages = {
  [WrapStatus.Init]: "Confirm Unwrapping",
  [WrapStatus.Pending]: "Unwrapping your token",
  [WrapStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
  [WrapStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
  [WrapStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
  [WrapStatus.Confirmed]: "Your asset has been successfully unwrapped!",
};
type UnwrapToken = {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
  type: "ERC-20";
};
const UnwrapStep = ({ nextStep }) => {
  const { wscProvider, tokens, stargateInfo, evmTokenAddress } = useContext();
  const [selectedUnwrapToken, setSelectedUnwrapToken] = React.useState<UnwrapToken | null>(null);
  const [txHash, setTxHash] = React.useState<null | string | undefined>(null);
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
      if (response === statusUnwrapMessages.Confirmed) {
        setTxHash(null);
        setTimeout(() => {
          nextStep();
        }, DEFAULT_STEP_TIMEOUT);
      }
    },
    txHash != null ? 4000 : null
  );

  useEffect(() => {
    const selectedToken = tokens.find((t) => t.contractAddress === evmTokenAddress);
    if (!selectedToken) return;
    setSelectedUnwrapToken(selectedToken);
  }, [tokens, evmTokenAddress]);

  const unwrapToken = async () => {
    if (!selectedUnwrapToken || !wscProvider) return;
    setTxStatus(WrapStatus.Init);

    try {
      const txHash = await wscProvider.unwrap(
        undefined,
        selectedUnwrapToken.contractAddress,
        new BigNumber(selectedUnwrapToken.balance)
      );
      setTxHash(txHash);
      setTxStatus(WrapStatus.Pending);
    } catch (err) {
      console.error(err);
      setTxStatus(WrapStatus.Error);
      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const fee =
    stargateInfo != null ? new BigNumber(stargateInfo?.stargateMinNativeTokenToL1) : null;

  return (
    <div>
      <StepTitle>Unwrap Tokens: Liberating Assets from Wrapper Chains</StepTitle>
      <StepDescription>
        Unwrap Tokens liberate assets from wrapper chains, providing users with the ability to
        seamlessly retrieve their original tokens from a wrapped form.
      </StepDescription>
      <BalancesWrapper>
        <LabelWithBalance
          label="You're moving:"
          amount={
            selectedUnwrapToken?.balance &&
            convertWeiToTokens({
              valueWei: selectedUnwrapToken?.balance,
              token: selectedUnwrapToken,
            }).toFixed()
          }
          assetName={selectedUnwrapToken?.symbol}
        />
        <LabelWithBalance label="Unwrapping fee:" amount={fee?.toFixed()} assetName={"mADA"} />
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
        <SuccessWrapper>
          <CheckCircle2 />
          <span>{statusUnwrapMessages[TxPendingStatus.Confirmed]}</span>
        </SuccessWrapper>
      )}
      {(isIdle || isError) && (
        <Button variant="primary" onClick={unwrapToken}>
          Confirm Unwrapping
        </Button>
      )}
    </div>
  );
};

export default UnwrapStep;

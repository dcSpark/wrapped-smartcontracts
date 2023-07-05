import React, { useMemo } from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepTitle,
  SuccessWrapper,
} from "./styles";
import { erc20ABI, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useContext } from "../ConnectWSC";
import Button from "../Common/Button";
import { CheckCircle2 } from "lucide-react";
import { Spinner } from "../Common/Spinner";
import { DEFAULT_STEP_TIMEOUT } from "./constants";
import { ethers } from "ethers";

const bridgeAddress = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";

const TokenAllowanceStep = ({ nextStep }) => {
  const { tokens } = useContext();
  const { evmTokenAddress } = useContext();

  const selectedToken = useMemo(
    () => tokens.find((t) => t.contractAddress === evmTokenAddress),
    [tokens, evmTokenAddress]
  );

  const { config, isLoading: isPreparingLoading } = usePrepareContractWrite({
    address: evmTokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      bridgeAddress,
      selectedToken && ethers.utils.parseUnits(selectedToken?.balance, selectedToken?.decimals),
    ],
    enabled: !!selectedToken,
    overrides: {
      gasLimit: ethers.BigNumber.from(500000),
    },
  });

  const { data, write, isLoading: isWritingContract } = useContractWrite(config);

  const {
    isLoading: isWaitingForTxLoading,
    isSuccess,
    isError,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
    onSuccess: () => {
      setTimeout(() => {
        nextStep();
      }, DEFAULT_STEP_TIMEOUT);
    },
  });

  const isLoadingTx = isPreparingLoading || isWritingContract || isWaitingForTxLoading;

  return (
    <div>
      <StepTitle>Token Allowance: Empowering Controlled Asset Transfers</StepTitle>
      <StepDescription style={{ marginBottom: 30 }}>
        Allow the smart contract to spend the specified amount of tokens on your behalf, enabling
        the unwrapping process from the Sidechain to the L1 chain.
      </StepDescription>
      {isLoadingTx && (
        <SpinnerWrapper>
          <Spinner />
          <span>Approving token allowance</span>
        </SpinnerWrapper>
      )}
      {isError && <ErrorMessage role="alert">Ups, something went wrong.</ErrorMessage>}
      {isSuccess && (
        <SuccessWrapper>
          <CheckCircle2 />
          <span>You've successfully approved the bridge to spend your tokens.</span>
        </SuccessWrapper>
      )}
      {isSuccess || isLoadingTx ? null : (
        <Button disabled={!write} variant="primary" onClick={() => write?.()}>
          Grant token allowance
        </Button>
      )}
    </div>
  );
};

export default TokenAllowanceStep;

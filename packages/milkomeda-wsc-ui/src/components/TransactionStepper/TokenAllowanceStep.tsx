import React, { useMemo } from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
} from "./styles";
import { erc20ABI, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useContext } from "../ConnectWSC";
import Button from "../Common/Button";
import { Spinner } from "../Common/Spinner";
import { ethers } from "ethers";
import { SuccessMessage } from "./WrapStep";

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
      selectedToken != null
        ? ethers.utils.parseUnits(selectedToken?.balance, selectedToken?.decimals)
        : ethers.BigNumber.from(0),
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
  });

  const isLoadingTx = isWritingContract || isWaitingForTxLoading;

  return (
    <>
      <StepLargeHeight>
        <StepTitle>Token Allowance: Lacus suspendisse faucibus</StepTitle>
        <StepDescription style={{ marginBottom: 30 }}>
          Porttitor rhoncus dolor purus non. Id cursus metus aliquam eleifend mi in nulla posuere
          sollicitudin. Lacus suspendisse faucibus interdum posuere lorem.
        </StepDescription>
        {isPreparingLoading && (
          <SpinnerWrapper>
            <Spinner />
            <span>Preparing transaction</span>
          </SpinnerWrapper>
        )}
        {isLoadingTx && (
          <SpinnerWrapper>
            <Spinner />
            <span>Approving token allowance</span>
          </SpinnerWrapper>
        )}
        {isError && <ErrorMessage role="alert">Ups, something went wrong.</ErrorMessage>}

        {isSuccess && (
          <>
            <SuccessMessage
              message="You've successfully approved token allowance."
              // txHash={txHash}
            />
            <Button variant="primary" onClick={nextStep}>
              Continue
            </Button>
          </>
        )}
      </StepLargeHeight>
      {!isSuccess && (
        <Button disabled={!write || isLoadingTx} variant="primary" onClick={() => write?.()}>
          Grant token allowance
        </Button>
      )}
    </>
  );
};

export default TokenAllowanceStep;

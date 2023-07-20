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
import { EVM_EXPLORER_URL } from "../../constants/transaction";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";

const BRIDGE_ADDRESS = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";

const TokenAllowanceStep = ({ nextStep }) => {
  const { tokens } = useContext();
  const { options } = useTransactionConfigWSC();

  const selectedToken = useMemo(
    () => tokens.find((t) => t.contractAddress === options.evmTokenAddress),
    [tokens, options.evmTokenAddress]
  );

  const { config, isLoading: isPreparingLoading } = usePrepareContractWrite({
    address: options.evmTokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      BRIDGE_ADDRESS,
      selectedToken != null
        ? ethers.BigNumber.from(selectedToken?.balance)
        : ethers.BigNumber.from(0),
    ],
    enabled: !!selectedToken,
    overrides: {
      gasLimit: ethers.BigNumber.from(500000),
    },
  });

  const { data, write, isLoading: isWritingContract, isIdle } = useContractWrite(config);

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
        <StepTitle>Token Allowance</StepTitle>
        <StepDescription style={{ marginBottom: 30 }}>
          Authorize the seamless transfer of your assets between the EVM and Mainchain networks.
          Perform a token allowance transaction to enable the subsequent unwrapping and secure
          transfer of the asset back to your Mainchain wallet.
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
              href={`${EVM_EXPLORER_URL}/tx/${data?.hash}`}
              viewLabel="EVM Explorer"
            />
            <Button variant="primary" onClick={nextStep}>
              Continue
            </Button>
          </>
        )}
      </StepLargeHeight>

      {(isIdle || isError) && (
        <Button disabled={!write} variant="primary" onClick={() => write?.()}>
          Grant token allowance
        </Button>
      )}
    </>
  );
};

export default TokenAllowanceStep;

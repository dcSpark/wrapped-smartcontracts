import React from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
} from "./styles";
import { Spinner } from "../Common/Spinner";
import { SuccessMessage } from "./WrapStep";
import { EVM_EXPLORER_URL } from "../../constants/transaction";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import ThemedButton, { ThemeContainer } from "../Common/ThemedButton";

const ActionExecutionStep = ({ nextStep }) => {
  const {
    options: { evmContractRequest },
  } = useTransactionConfigWSC();
  console.log(evmContractRequest, "evmContractRequest");

  const prepareContractWriteQuery = usePrepareContractWrite({
    address: evmContractRequest.address as `0x${string}`,
    abi: evmContractRequest.abi,
    /* eslint @typescript-eslint/no-explicit-any: "off" */
    functionName: evmContractRequest.functionName as any,
    args: evmContractRequest.args,
    enabled: evmContractRequest.enabled,
    overrides: {
      gasLimit: ethers.BigNumber.from(1_000_000),
      ...evmContractRequest.overrides,
    },
  });
  console.log(prepareContractWriteQuery, "prepareContractWriteQuery");

  const contractWriteQuery = useContractWrite(prepareContractWriteQuery.config);
  console.log(contractWriteQuery, "contractWriteQuery");

  const waitForTransactionQuery = useWaitForTransaction({
    hash: contractWriteQuery.data?.hash,
    enabled: !!contractWriteQuery.data?.hash,
  });

  const isIdle = contractWriteQuery.isIdle;
  const isLoading = contractWriteQuery.isLoading || waitForTransactionQuery.isLoading;
  const isSuccess = waitForTransactionQuery.isSuccess;
  const isError = waitForTransactionQuery.isError;

  return (
    <>
      <StepLargeHeight>
        <StepTitle>Action execution</StepTitle>
        <StepDescription>
          Effortlessly execute your desired action within the EVM DApp environment by exchanging
          your wrapped tokens for the specific asset you wish to transact with. Enjoy a seamless
          transaction experience within the EVM DApp using Wrapped Smart Contracts!
        </StepDescription>

        {prepareContractWriteQuery.isLoading && (
          <SpinnerWrapper>
            <Spinner />
            <span>Preparing transaction</span>
          </SpinnerWrapper>
        )}
        {isLoading && (
          <SpinnerWrapper>
            <Spinner />
            <span>Executing transaction</span>
          </SpinnerWrapper>
        )}
        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong.{" "}
            {waitForTransactionQuery.error ? `Error: ${waitForTransactionQuery.error}` : ""}{" "}
          </ErrorMessage>
        )}
        {isSuccess && (
          <>
            <SuccessMessage
              message="Transaction has been successfully executed."
              href={`${EVM_EXPLORER_URL}/tx/${contractWriteQuery?.data?.hash}`}
              viewLabel="EVM Explorer"
            />
            <ThemeContainer onClick={nextStep}>
              <ThemedButton variant="primary">Continue</ThemedButton>
            </ThemeContainer>
          </>
        )}
      </StepLargeHeight>
      {(isIdle || isError) && (
        <ThemeContainer
          disabled={!contractWriteQuery?.write}
          onClick={() => contractWriteQuery?.write?.()}
        >
          <ThemedButton variant="primary">Execute Action</ThemedButton>
        </ThemeContainer>
      )}
    </>
  );
};

export default ActionExecutionStep;

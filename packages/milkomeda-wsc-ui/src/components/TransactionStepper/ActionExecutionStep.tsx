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
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import { getEvmExplorerUrl } from "../../utils/transactions";
import Button from "../Common/Button";

const ActionExecutionStep = ({ nextStep }) => {
  const {
    options: { evmContractRequest },
  } = useTransactionConfigWSC();
  const { chain } = useNetwork();

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

  const contractWriteQuery = useContractWrite(prepareContractWriteQuery.config);

  const waitForTransactionQuery = useWaitForTransaction({
    hash: contractWriteQuery.data?.hash,
    enabled: !!contractWriteQuery.data?.hash,
  });

  const isIdle = contractWriteQuery.isIdle;
  const isLoading = contractWriteQuery.isLoading || waitForTransactionQuery.isLoading;
  const isSuccess = waitForTransactionQuery.isSuccess;
  const isError =
    waitForTransactionQuery.isError ||
    contractWriteQuery.isError ||
    prepareContractWriteQuery.isError;

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
            {waitForTransactionQuery.error
              ? `Error: ${waitForTransactionQuery.error.message}`
              : ""}{" "}
            {contractWriteQuery.error ? `Error: ${contractWriteQuery.error.message}` : ""}{" "}
            {prepareContractWriteQuery.error
              ? `Error: ${prepareContractWriteQuery.error.message}`
              : ""}{" "}
          </ErrorMessage>
        )}
        {isSuccess && (
          <>
            <SuccessMessage
              message="Transaction has been successfully executed."
              href={`${getEvmExplorerUrl(chain?.id)}/tx/${contractWriteQuery?.data?.hash}`}
              viewLabel="EVM Explorer"
            />
            <Button variant={"primary"} onClick={nextStep}>
              Continue
            </Button>
          </>
        )}
      </StepLargeHeight>
      {(isIdle || isError) && (
        <Button
          variant="primary"
          disabled={!contractWriteQuery?.write}
          onClick={() => contractWriteQuery?.write?.()}
        >
          Execute Action
        </Button>
      )}
    </>
  );
};

export default ActionExecutionStep;

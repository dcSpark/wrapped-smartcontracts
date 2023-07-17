import React from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
} from "./styles";
import Button from "../Common/Button";
import { useContext } from "../ConnectWSC";
import { Spinner } from "../Common/Spinner";
import { SuccessMessage } from "./WrapStep";
import { EVM_EXPLORER_URL } from "../../constants/transaction";
import { erc20ABI, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";
import { useTransactionConfigWSC, WscSmartContractInfo } from "../TransactionConfigWSC";
import BigNumber from "bignumber.js";

export function getCallParameters(args): any {
  return {
    accessList: args.accessList,
    account: args.account,
    blockNumber: args.blockNumber,
    blockTag: args.blockTag,
    data: args.data,
    gas: args.gas,
    gasPrice: args.gasPrice,
    maxFeePerGas: args.maxFeePerGas,
    maxPriorityFeePerGas: args.maxPriorityFeePerGas,
    nonce: args.nonce,
    to: args.to,
    value: args.value,
  };
}

export const useWriteSmartContract = ({
  address,
  abi,
  functionName,
  args = [],
  overrides,
  enabled,
}: WscSmartContractInfo) => {
  const prepareContractWriteQuery = usePrepareContractWrite({
    address: address as `0x${string}`,
    abi: abi,
    functionName: functionName as any,
    args: args,
    enabled: enabled,
    overrides: { gasLimit: ethers.BigNumber.from(500000), ...overrides },
  });

  const contractWriteQuery = useContractWrite(prepareContractWriteQuery.config);

  const waitForTransactionQuery = useWaitForTransaction({
    hash: contractWriteQuery.data?.hash,
    enabled: !!contractWriteQuery.data?.hash,
  });

  return { prepareContractWriteQuery, contractWriteQuery, waitForTransactionQuery };
};

// const useContract = ({ address, abi, functionName, args = [], overrides, enabled }) => {};
// const getContractConfig = ({ address, abi, functionName, args = [], overrides, enabled }) => {
//   return { address, abi, functionName, args = [], overrides, enabled };
// };

const ActionExecutionStep = ({ nextStep }) => {
  const { wscActionRef } = useContext();
  const [evmTxHash, setEvmTxHash] = React.useState<string | undefined>();
  const {
    options: { wscSmartContractInfo },
  } = useTransactionConfigWSC();
  console.log(wscSmartContractInfo, "wscSmartContractInfo");

  const { prepareContractWriteQuery, contractWriteQuery, waitForTransactionQuery } =
    useWriteSmartContract(wscSmartContractInfo);

  console.log(prepareContractWriteQuery, "prepareContractWriteQuery");

  const [executionTxStatus, setExecutionTxStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const [txStatusError, setTxStatusError] = React.useState<string | null>(null);

  const onWSCAction = async () => {
    if (wscActionRef?.current === null) return;
    setExecutionTxStatus("pending");

    try {
      const hash = await wscActionRef.current();
      setEvmTxHash(hash);
      setExecutionTxStatus("success");
    } catch (err) {
      setExecutionTxStatus("error");

      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const isIdle = executionTxStatus === "idle";
  const isLoading = executionTxStatus === "pending";
  const isSuccess = executionTxStatus === "success";
  const isError = executionTxStatus === "error";
  return (
    <>
      <StepLargeHeight>
        <StepTitle>Action execution</StepTitle>
        <StepDescription>
          Effortlessly execute your desired action within the EVM DApp environment by exchanging
          your wrapped tokens for the specific asset you wish to transact with. Enjoy a seamless
          transaction experience within the EVM DApp using Wrapped Smart Contracts!
        </StepDescription>
        <button
          onClick={() => {
            // @ts-ignore
            contractWriteQuery?.write();
          }}
        >
          Submit
        </button>
        {isLoading && (
          <SpinnerWrapper>
            <Spinner />
            <span>Executing transaction</span>
          </SpinnerWrapper>
        )}
        {isSuccess && (
          <>
            <SuccessMessage
              message="Transaction has been successfully executed."
              href={`${EVM_EXPLORER_URL}/tx/${evmTxHash}`}
              viewLabel="EVM Explorer"
            />
            <Button variant="primary" disabled={!isSuccess} onClick={nextStep}>
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
        <Button variant="primary" onClick={onWSCAction}>
          Execute Action
        </Button>
      )}
    </>
  );
};

export default ActionExecutionStep;

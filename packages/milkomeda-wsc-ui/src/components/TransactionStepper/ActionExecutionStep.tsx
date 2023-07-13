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

const ActionExecutionStep = ({ nextStep }) => {
  const { wscActionRef } = useContext();
  const [evmTxHash, setEvmTxHash] = React.useState<string | undefined>();

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

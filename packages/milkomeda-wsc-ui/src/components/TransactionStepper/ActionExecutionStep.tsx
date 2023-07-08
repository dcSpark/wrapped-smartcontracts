import React from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
  SuccessWrapper,
} from "./styles";
import Button from "../Common/Button";
import { useContext } from "../ConnectWSC";
import { Spinner } from "../Common/Spinner";
import { CheckCircle2 } from "lucide-react";
import { DEFAULT_STEP_TIMEOUT } from "./constants";

const ActionExecutionStep = ({ nextStep }) => {
  const { wscActionRef } = useContext();
  const [executionTxStatus, setExecutionTxStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const [txStatusError, setTxStatusError] = React.useState<string | null>(null);

  const onWSCAction = async () => {
    if (wscActionRef?.current === null) return;
    setExecutionTxStatus("pending");

    try {
      await wscActionRef.current();
      setExecutionTxStatus("success");
      setTimeout(() => {
        nextStep();
      }, DEFAULT_STEP_TIMEOUT);
    } catch (err) {
      setExecutionTxStatus("error");

      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  const isLoading = executionTxStatus === "pending";
  const isSuccess = executionTxStatus === "success";
  const isError = executionTxStatus === "error";
  return (
    <>
      <StepLargeHeight>
        <StepTitle>Executing Actions: sed do eiusmod tempor incididunt ut labore</StepTitle>
        <StepDescription>
          Non enim praesent elementum facilisis leo vel fringilla. Convallis convallis tellus id
          interdum velit laoreet.
        </StepDescription>
        {isLoading && (
          <SpinnerWrapper>
            <Spinner />
            <span>Executing transaction</span>
          </SpinnerWrapper>
        )}
        {isSuccess && (
          <SuccessWrapper>
            <CheckCircle2 />
            <span>Transaction has been successfully executed!</span>
          </SuccessWrapper>
        )}
        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
          </ErrorMessage>
        )}
      </StepLargeHeight>
      <Button variant="primary" onClick={onWSCAction}>
        Execute Action
      </Button>
    </>
  );
};

export default ActionExecutionStep;

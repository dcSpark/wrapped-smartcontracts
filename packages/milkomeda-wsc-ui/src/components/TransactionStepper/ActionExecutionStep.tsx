import React from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepTitle,
  SuccessWrapper,
} from "./styles";
import Button from "../Common/Button";
import { useContext } from "../ConnectWSC";
import { Spinner } from "../Common/Spinner";
import { CheckCircle2 } from "lucide-react";
import { DEFAULT_STEP_TIMEOUT } from "./constants";

const ActionExecutionStep = ({ nextStep }) => {
  const { wscAction } = useContext();
  const [executionTxStatus, setExecutionTxStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const [txStatusError, setTxStatusError] = React.useState<string | null>(null);

  const onWSCAction = async () => {
    setExecutionTxStatus("pending");

    try {
      await wscAction?.();
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
    <div>
      <StepTitle>Executing Actions with Wrap Tokens: Smart Contract Interoperability</StepTitle>
      <StepDescription>
        Discover the power of wrap tokens in smart contracts, enabling seamless execution of
        actions across multiple blockchains.
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
      <Button variant="primary" onClick={onWSCAction}>
        Execute Action
      </Button>
    </div>
  );
};

export default ActionExecutionStep;

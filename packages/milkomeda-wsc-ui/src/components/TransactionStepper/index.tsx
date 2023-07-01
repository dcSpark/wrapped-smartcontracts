import React, { useState } from "react";
import { useStepper } from "../Common/Stepper/use-stepper";
import {
  Balance,
  BalanceContainer,
  LoadingBalance,
  StepperTransactionContainer,
  StepperTransactionContent,
  StepperTransactionInner,
} from "../Pages/Profile/styles";
import { Stepper, StepperStep } from "../Common/Stepper";
import { CheckCircle2, XCircle } from "lucide-react";
import Button from "../Common/Button";
import WrapStep from "./WrapStep";
import ActionExecutionStep from "./ActionExecutionStep";
import UnwrapStep from "./UnwrapStep";
import TokenAllowanceStep from "./TokenAllowanceStep";
import { useContext } from "../ConnectWSC";
import { TransactionCompleteContainer } from "./styles";
import Confetti from "react-confetti";

// TODO: this might be need to be passed on the config provider
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";
const cardanoAddressTStableCoin =
  "27f2e501c0fa1f9b7b79ae0f7faeb5ecbe4897d984406602a1afd8a874537461626c65436f696e";

const TransactionStepper = () => {
  const { nextStep, activeStep } = useStepper({
    initialStep: 0,
  });
  const { setOpen } = useContext();

  const steps = [
    {
      label: "Cardano Wrapping",
      children: <WrapStep nextStep={nextStep} />,
    },
    { label: "Action Execution", children: <ActionExecutionStep nextStep={nextStep} /> },
    {
      label: "Token Allowance",
      children: <TokenAllowanceStep nextStep={nextStep} />,
    },
    { label: "Milkomeda Unwrapping", children: <UnwrapStep nextStep={nextStep} /> },
  ];

  return (
    <StepperTransactionContainer>
      <Stepper
        activeStep={activeStep}
        successIcon={<CheckCircle2 />}
        errorIcon={<XCircle />}
        labelOrientation="vertical"
      >
        {steps.map((step, index) => (
          <StepperStep index={index} key={index} {...step}>
            <StepperTransactionContent>{step.children}</StepperTransactionContent>
          </StepperStep>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <>
            <TransactionCompleteContainer>
              <h1>Transaction completed!</h1>
              <p>You've successfully interacted with the Milkomeda Wrapped Smart Contract.</p>
            </TransactionCompleteContainer>
            <Confetti
              recycle={false}
              style={{ position: "absolute", inset: 0, width: "100%" }}
              initialVelocityX={10}
              initialVelocityY={10}
            />
            <Button
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </Button>
          </>
        ) : null}
      </div>
    </StepperTransactionContainer>
  );
};
export default TransactionStepper;

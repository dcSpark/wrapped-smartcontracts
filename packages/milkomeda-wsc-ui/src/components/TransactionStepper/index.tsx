import React, { useMemo } from "react";
import { useStepper } from "../Common/Stepper/use-stepper";
import { StepperTransactionContainer, StepperTransactionContent } from "../Pages/Profile/styles";
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

const TransactionStepper = () => {
  const { nextStep, activeStep, resetSteps } = useStepper({
    initialStep: 0,
  });
  const { stepTxDirection, setOpen } = useContext();

  const steps = useMemo(() => {
    return stepTxDirection === "buy"
      ? [
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
        ]
      : [
          {
            label: "Cardano Wrapping",
            children: <WrapStep nextStep={nextStep} />,
          },
          {
            label: "Token Allowance",
            children: <TokenAllowanceStep nextStep={nextStep} />,
          },
          { label: "Action Execution", children: <ActionExecutionStep nextStep={nextStep} /> },

          { label: "Milkomeda Unwrapping", children: <UnwrapStep nextStep={nextStep} /> },
        ];
  }, [stepTxDirection]);

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
                resetSteps();
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

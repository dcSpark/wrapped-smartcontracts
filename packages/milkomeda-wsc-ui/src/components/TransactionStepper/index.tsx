import React, { useEffect, useMemo } from "react";
import { useStepper } from "../Common/Stepper/use-stepper";
import {
  StepperTransactionContainer,
  StepperTransactionContent,
  StepperTransactionSuccess,
} from "../Pages/Profile/styles";
import { Stepper, StepperStep } from "../Common/Stepper";
import { CheckCircle2, XCircle } from "lucide-react";
import WrapStep from "./WrapStep";
import ActionExecutionStep from "./ActionExecutionStep";
import UnwrapStep from "./UnwrapStep";
import TokenAllowanceStep from "./TokenAllowanceStep";
import { useContext } from "../ConnectWSC";
import Confetti from "react-confetti";
import Button from "../Common/Button";
import { StepDescription, StepTitle } from "./styles";

const TransactionStepper = () => {
  const { nextStep, activeStep, resetSteps } = useStepper({
    initialStep: 0,
  });
  const { stepTxDirection } = useContext();

  const steps = useMemo(() => {
    return stepTxDirection === "buy"
      ? [
          {
            label: "Cardano Wrapping",
            children: <WrapStep nextStep={nextStep} />,
          },
          {
            label: "Action Execution",
            children: <ActionExecutionStep nextStep={nextStep} />,
          },
          {
            label: "Token Allowance",
            children: <TokenAllowanceStep nextStep={nextStep} />,
          },

          {
            label: "Milkomeda Unwrapping",
            children: <UnwrapStep nextStep={nextStep} />,
          },
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
          {
            label: "Action Execution",
            children: <ActionExecutionStep nextStep={nextStep} />,
          },

          {
            label: "Milkomeda Unwrapping",
            children: <UnwrapStep nextStep={nextStep} />,
          },
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
          <StepperStep isCurrentStep={index === activeStep} index={index} key={index} {...step}>
            <StepperTransactionContent>{step.children}</StepperTransactionContent>
          </StepperStep>
        ))}
      </Stepper>
      <SuccessStep activeStep={activeStep} resetSteps={resetSteps} steps={steps} />
    </StepperTransactionContainer>
  );
};
export default TransactionStepper;

const SuccessStep = ({ activeStep, steps, resetSteps }) => {
  const { setOpen } = useContext();

  return (
    <StepperTransactionSuccess>
      {activeStep === steps.length && (
        <div>
          <StepTitle style={{ marginBottom: 30 }}>Congratulations!</StepTitle>
          <StepDescription>
            You have successfully completed the entire process interacting with WSCs.
          </StepDescription>

          <Button
            variant="primary"
            onClick={() => {
              setOpen(false);
              resetSteps();
            }}
          >
            Close
          </Button>
          <Confetti
            recycle={false}
            tweenDuration={6000}
            onConfettiComplete={() => {
              setOpen(false);
              resetSteps();
            }}
            style={{ position: "absolute", inset: 0, width: "100%" }}
            initialVelocityX={10}
            initialVelocityY={10}
          />
        </div>
      )}
    </StepperTransactionSuccess>
  );
};

//https://bridge-explorer.milkomeda.com/cardano-mainnet/search/tx?query=0xea228841fb53b0b1857c8b60055039216c7e80e8524e559bf9e038c444ea0abd

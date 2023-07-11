import React, { useMemo } from "react";
import { useStepper } from "../Common/Stepper/use-stepper";
import { StepperTransactionContainer, StepperTransactionContent } from "../Pages/Profile/styles";
import { Stepper, StepperStep } from "../Common/Stepper";
import { CheckCircle2, XCircle } from "lucide-react";
import WrapStep from "./WrapStep";
import ActionExecutionStep from "./ActionExecutionStep";
import UnwrapStep from "./UnwrapStep";
import TokenAllowanceStep from "./TokenAllowanceStep";
import { useContext } from "../ConnectWSC";

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
          { label: "Action Execution", children: <ActionExecutionStep nextStep={nextStep} /> },
          {
            label: "Token Allowance",
            children: <TokenAllowanceStep nextStep={nextStep} />,
          },

          {
            label: "Milkomeda Unwrapping",
            children: <UnwrapStep nextStep={nextStep} resetSteps={resetSteps} />,
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
          { label: "Action Execution", children: <ActionExecutionStep nextStep={nextStep} /> },

          {
            label: "Milkomeda Unwrapping",
            children: <UnwrapStep nextStep={nextStep} resetSteps={resetSteps} />,
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
    </StepperTransactionContainer>
  );
};
export default TransactionStepper;

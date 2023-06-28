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

const balance = true;

const TransactionStepper = () => {
  const [value, setValue] = useState<"loading" | "error">("loading");

  const steps = [
    {
      label: "Cardano Wrapping",
      children: (
        <WrapStep
          defaultTokenUnit="lovelace" // TODO: hardcoded for now
          defaultAmountEth="30"
          // setSelectedToken={setSelectedToken}
          // selectedToken={selectedToken}
          // amount={amount}
          // setAmount={setAmount}
          // defaultAmountEth={
          //   currentAmountWei
          //     ? ethers.utils.formatEther(new BigNumber(currentAmountWei).toString())
          //     : "0"
          // }
          // goNextStep={handleNextStep}
        />
      ),
    },
    { label: "Action Execution", children: <ActionExecutionStep /> },
    { label: "Token Allowance", children: <TokenAllowanceStep /> },
    { label: "Milkomeda Unwrapping", children: <UnwrapStep /> },
  ];

  const {
    nextStep,
    prevStep,
    resetSteps,
    activeStep,
    isDisabledStep,
    isLastStep,
    isOptionalStep,
  } = useStepper({
    initialStep: 0,
    steps,
  });

  return (
    <StepperTransactionContainer>
      <Stepper
        activeStep={activeStep}
        successIcon={<CheckCircle2 />}
        errorIcon={<XCircle />}
        labelOrientation="vertical"
        state={value}
      >
        {steps.map((step, index) => (
          <StepperStep index={index} key={index} {...step}>
            <StepperTransactionContent>{step.children}</StepperTransactionContent>
          </StepperStep>
        ))}
      </Stepper>
      <StepperTransactionInner>
        {activeStep === steps.length ? (
          <>
            <h2>All steps completed!</h2>
            <Button onClick={resetSteps}>Reset</Button>
          </>
        ) : (
          <>
            <Button disabled={isDisabledStep} onClick={prevStep}>
              Prev
            </Button>
            <Button onClick={nextStep}>
              {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
            </Button>
          </>
        )}
      </StepperTransactionInner>
    </StepperTransactionContainer>
  );
};
export default TransactionStepper;

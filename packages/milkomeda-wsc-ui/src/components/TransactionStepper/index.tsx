import React, { useMemo } from "react";
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
import { StepDescription, StepTitle } from "./styles";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import { LOVELACE_UNIT } from "../../constants/transaction";

const TransactionStepper = () => {
  const { nextStep, activeStep, resetSteps } = useStepper({
    initialStep: 0,
  });
  const [isWSCTransactionSuccess, setIsWSCTransactionSuccess] = React.useState(false);
  const {
    options: { defaultWrapToken },
  } = useTransactionConfigWSC();
  const isWrappingNativeTokenFirst = defaultWrapToken.unit === LOVELACE_UNIT;

  const steps = useMemo(() => {
    return isWrappingNativeTokenFirst
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
            children: (
              <UnwrapStep
                onFinish={() => setIsWSCTransactionSuccess(true)}
                resetSteps={resetSteps}
              />
            ),
            isCompletedStep: isWSCTransactionSuccess,
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
            children: (
              <UnwrapStep
                onFinish={() => setIsWSCTransactionSuccess(true)}
                resetSteps={resetSteps}
              />
            ),
            isCompletedStep: isWSCTransactionSuccess,
          },
        ];
  }, [isWrappingNativeTokenFirst, isWSCTransactionSuccess]);

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

export const SuccessStep = () => {
  return (
    <StepperTransactionSuccess>
      <StepTitle style={{ marginBottom: 30 }}>Congratulations!</StepTitle>
      <StepDescription>
        Congratulations! Your assets has been unwrapped from the EVM and securely returned to your
        Mainchain Wallet. You can now manage and utilize your assets on the Mainchain blockchain
        with ease.
      </StepDescription>
      <Confetti
        recycle={false}
        tweenDuration={6000}
        style={{ position: "absolute", inset: 0, width: "100%" }}
        initialVelocityX={10}
        initialVelocityY={10}
      />
    </StepperTransactionSuccess>
  );
};

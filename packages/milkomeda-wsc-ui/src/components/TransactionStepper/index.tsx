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

const balance = true;

// TODO: this might be need to be passed on the config provider
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";
const cardanoAddressTStableCoin =
  "27f2e501c0fa1f9b7b79ae0f7faeb5ecbe4897d984406602a1afd8a874537461626c65436f696e";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";

const TransactionStepper = ({
  contractAddress = reserveCoinAddress, // TODO
}) => {
  const { nextStep, prevStep, activeStep } = useStepper({
    initialStep: 0,
  });
  const { setOpen } = useContext();

  const [value, setValue] = useState<"loading" | "error">("loading");

  const steps = [
    {
      label: "Cardano Wrapping",
      children: (
        <WrapStep
          // TODO: hardcoded for now
          defaultTokenUnit="lovelace"
          defaultAmountEth="30"
          nextStep={nextStep}
        />
      ),
    },
    { label: "Action Execution", children: <ActionExecutionStep nextStep={nextStep} /> },
    {
      label: "Token Allowance",
      children: <TokenAllowanceStep nextStep={nextStep} contractAddress={contractAddress} />,
    },
    { label: "Milkomeda Unwrapping", children: <UnwrapStep contractAddress={contractAddress} /> },
  ];

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
      <div>
        {activeStep === steps.length ? (
          <>
            <p>The entire process has been completed successfully</p>
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

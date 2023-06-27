import React, { useEffect, useState } from "react";
import { useContext } from "../../ConnectWSC";
import { nFormatter, truncateEthAddress } from "../../../utils";

import { useConnect, useDisconnect, useAccount, useNetwork } from "wagmi";

import {
  AvatarContainer,
  AvatarInner,
  ChainSelectorContainer,
  BalanceContainer,
  LoadingBalance,
  Balance,
  StepperTransactionContainer,
  StepperTransactionContent,
  StepperTransactionInner,
} from "./styles";

import { ModalBody, ModalContent, ModalH1, MainPageContent } from "../../Common/Modal/styles";
import Button from "../../Common/Button";

import { DisconnectIcon } from "../../../assets/icons";
import CopyToClipboard from "../../Common/CopyToClipboard";
import { AnimatePresence } from "framer-motion";

import { CheckCircle2, XCircle } from "lucide-react";

import { useStepper } from "../../Common/Stepper/use-stepper";
import { Stepper, StepperStep } from "../../Common/Stepper";

const balance = true;

const steps = [
  {
    label: "Cardano Wrapping",
    children: (
      <div>
        <h1>Cardano Wrapping</h1>

        <BalanceContainer>
          <AnimatePresence exitBeforeEnter initial={false}>
            {balance && (
              <Balance
                // key={`chain-${chain?.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/*{nFormatter(Number(balance?.formatted))}*/}
                {nFormatter(Number("10.00"))}
                {` `}
                {/*{balance?.symbol}*/}
                ADA
              </Balance>
            )}
            {!balance && (
              <LoadingBalance
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                &nbsp;
              </LoadingBalance>
            )}
          </AnimatePresence>
        </BalanceContainer>
      </div>
    ),
  },
  { label: "Action Execution", children: <div>Hi there 2</div> },
  { label: "Token Allowance", children: <div>Hi there 3</div> },
  { label: "Milkomeda Unwrapping", children: <div>Hi there 3</div> },
];

export const TransactionStepper = () => {
  const [value, setValue] = useState<"loading" | "error">("loading");

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

const Profile: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const context = useContext();

  const { reset } = useConnect();
  const { disconnect } = useDisconnect();

  const { chain } = useNetwork();
  const { address, isConnected, connector } = useAccount();
  const [shouldDisconnect, setShouldDisconnect] = useState(false);

  useEffect(() => {
    if (!isConnected) context.setOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (!shouldDisconnect) return;

    // Close before disconnecting to avoid layout shifting while modal is still open
    if (closeModal) {
      closeModal();
    } else {
      context.setOpen(false);
    }
    return () => {
      disconnect();
      reset();
    };
  }, [shouldDisconnect, disconnect, reset]);

  return (
    <MainPageContent>
      <ModalContent style={{ paddingBottom: 22, gap: 6, marginBottom: 40 }}>
        <ModalH1>
          <CopyToClipboard string={address}>{truncateEthAddress(address, "....")}</CopyToClipboard>
        </ModalH1>
        <ModalBody>
          <TransactionStepper />
        </ModalBody>
      </ModalContent>
      <Button onClick={() => setShouldDisconnect(true)} icon={<DisconnectIcon />}>
        Disconnect
      </Button>
    </MainPageContent>
  );
};

export default Profile;

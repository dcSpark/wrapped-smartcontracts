import React, { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Stepper, StepperStep } from "../Common/Stepper";
import { StepperTransactionContent } from "../Pages/Profile/styles";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ResetContainer } from "../../styles";
import { Container, TabsContent, TabsList, TabsRoot, TabsTrigger } from "./styles";
import { useWSCProvider } from "../../hooks/useWSCProvider";

export const WSCInterface = () => {
  const [activeStep, setActiveStep] = useState(0);
  const {
    wscProvider,
    pendingTxs,
    address,
    destinationBalance,
    originBalance,
    originTokens,
    tokens,
    originAddress,
  } = useWSCProvider();

  const isOriginBalanceNotZero = originBalance != null && +originBalance !== 0;
  const isDestinationBalanceNotZero = destinationBalance != null && +destinationBalance !== 0;

  const steps = [
    {
      label: "Cardano",
      isCompletedStep: isOriginBalanceNotZero,
    },
    {
      label: "WSC",
      isCompletedStep: isDestinationBalanceNotZero,
    },
    {
      label: "Dapp",
      description: "(Ready to Go)",
      isCompletedStep: isOriginBalanceNotZero && isDestinationBalanceNotZero,
    },
  ];

  return (
    <ResetContainer>
      <Container>
        <Stepper
          activeStep={activeStep}
          successIcon={<CheckCircle2 />}
          errorIcon={<XCircle />}
          labelOrientation="vertical"
        >
          {steps.map((step, index) => (
            <StepperStep
              isCurrentStep={index === activeStep}
              index={index}
              key={index}
              {...step}
            />
          ))}
        </Stepper>

        <TabsRoot defaultValue="about" orientation="vertical">
          <TabsList aria-label="WSC Wallet Content">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="cardano">Cardano</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="wsc-wallet">WSC Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <About />
          </TabsContent>
          <TabsContent value="cardano">
            <Cardano />
          </TabsContent>
          <TabsContent value="pending">
            <Pending />
          </TabsContent>
          <TabsContent value="wsc-wallet">
            <WSCWallet />
          </TabsContent>
        </TabsRoot>
      </Container>
    </ResetContainer>
  );
};

function About() {
  return (
    <div className="about-content">
      <h2 className="about-title">What are Wrapped Smart Contracts?</h2>
      <p className="about-description">
        Wrapped Smart Contracts are a new concept aimed at facilitating interaction with smart
        contracts on sidechains or Layer 2 (L2) solutions without the need for users to directly
        migrate to these new ecosystems.
        <br />
        <br /> The Layer 1 (L1) blockchain acts as a robust coordination layer, allowing users to
        execute smart contracts on sidechains or L2 while remaining on the L1 blockchain. This
        provides a user-friendly experience, as users can interact with various systems without
        changing wallets or needing a deep understanding of the underlying processes.
      </p>
      <a className="about-link" href="http://example.com/my-article-link" target="_blank">
        Read more
      </a>

      <h2 className="about-title">How it works</h2>
      <p className="about-description">
        Every single step requires user interaction in the form of a transaction.
      </p>
      <ul className="about-items">
        {[
          "User Action: The user initiates an action on a dApp while on the main blockchain. This request is translated into specific parameters for a proxy smart contract.",
          "Proxy Deployment and Execution: A proxy smart contract, reflecting the user's intent, is deployed on the sidechain. The proxy contract then interacts with the appropriate smart contract on the sidechain to execute the desired action.",
          "Result Processing: The outcome from the sidechain smart contract execution is relayed back to the user on the main blockchain. The user's state is updated, and they see the results of their action on the dApp, all while staying on the main blockchain.",
        ].map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <a className="about-link" href="http://example.com/my-article-link" target="_blank">
        Read more
      </a>
    </div>
  );
}

function Cardano() {
  const { originAddress } = useWSCProvider();

  return (
    <div>
      <h2>Assets in Your Cardano Wallet</h2>
      {originAddress ? (
        <p className="address">
          Origin Address <span> {originAddress}</span>
        </p>
      ) : null}
      <ul></ul>
    </div>
  );
}
function Pending() {
  const { pendingTxs } = useWSCProvider();

  return (
    <div>
      <h2>List of pending transactions between Cardano and Milkomeda</h2>
      <ul>
        {pendingTxs?.length === 0 && <p className="not-found">No pending transaction found.</p>}
        {pendingTxs?.length > 0 &&
          pendingTxs.map((tx, index) => {
            const localDateTime = new Date(tx.timestamp * 1000).toLocaleString();
            const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;
            return (
              <li key={index}>
                <div>
                  <span>Hash:</span>
                  <a href={tx.explorer} className="value" target="_blank" rel="noreferrer">
                    {shortHash}
                  </a>
                </div>
                <div>
                  <span>Timestamp:</span>
                  <span className="value">{localDateTime}</span>
                </div>
                <div>
                  <span>Type:</span>
                  <span>{tx.type === "Wrap" ? "Moving to Milkomeda" : "Moving to L1"}</span>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
function WSCWallet() {
  const { address } = useWSCProvider();

  return (
    <div>
      <h2>Assets in Your Wrapped Smart Contract Wallet</h2>
      {address ? (
        <p className="address">
          Connected WSC Address <span>{address}</span>
        </p>
      ) : null}
    </div>
  );
}

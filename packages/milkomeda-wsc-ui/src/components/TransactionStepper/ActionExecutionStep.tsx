import React from "react";
import { StepDescription, StepTitle } from "./styles";
import Button from "../Common/Button";

const ActionExecutionStep = ({ nextStep }) => {
  const onWSCAction = () => {
    nextStep();
  };
  return (
    <div>
      <StepTitle>Executing Actions with Wrap Tokens: Smart Contract Interoperability</StepTitle>
      <StepDescription>
        Discover the power of wrap tokens in smart contracts, enabling seamless execution of
        actions across multiple blockchains. These tokens act as a bridge, empowering smart
        contracts to interact with assets and access decentralized applications on different
        blockchain networks.
      </StepDescription>
      <Button variant="primary" onClick={onWSCAction}>
        Confirm wrapping
      </Button>
    </div>
  );
};

export default ActionExecutionStep;

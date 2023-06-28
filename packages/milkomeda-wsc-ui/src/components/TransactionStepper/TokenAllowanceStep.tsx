import React from "react";
import { AnimatePresence } from "framer-motion";
import { Balance, BalanceContainer, LoadingBalance } from "../Pages/Profile/styles";
import { LabelText, LabelWithBalanceContainer, StepDescription, StepTitle } from "./styles";

const TokenAllowanceStep = () => {
  return (
    <div>
      <StepTitle>Token Allowance: Empowering Controlled Asset Transfers</StepTitle>
      <StepDescription>
        Token Allowance provides users with fine-grained control over asset transfers within the
        blockchain ecosystem. With this powerful feature, users can set specific permission levels
        for the transfer of their tokens, granting temporary or permanent access to designated
        individuals or smart contracts.
      </StepDescription>
    </div>
  );
};

export default TokenAllowanceStep;

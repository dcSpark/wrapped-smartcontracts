import React from "react";
import { AnimatePresence } from "framer-motion";
import { Balance, BalanceContainer, LoadingBalance } from "../Pages/Profile/styles";
import {
  ErrorMessage,
  LabelText,
  LabelWithBalanceContainer,
  SpinnerWrapper,
  StepDescription,
  StepTitle,
  SuccessWrapper,
} from "./styles";
import { erc20ABI, useSigner } from "wagmi";
import { useContext } from "../ConnectWSC";
import { ethers } from "ethers";
import Button from "../Common/Button";
import { CheckCircle2 } from "lucide-react";
import { TxPendingStatus } from "milkomeda-wsc";
import { Spinner } from "../Common/Spinner";
import { convertTokensToWei } from "../../utils/convertWeiToTokens";

const bridgeAddress = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";

const TokenAllowanceStep = ({ contractAddress, nextStep }) => {
  const { data: signer } = useSigner();
  const { tokens } = useContext();
  const [approvalStatus, setApprovalStatus] = React.useState("idle");

  const onTokenAllowance = async () => {
    const selectedToken = tokens.find((t) => t.contractAddress === contractAddress);
    if (!selectedToken) return;
    const convertAmountBN = convertTokensToWei({
      value: selectedToken.balance,
      token: selectedToken,
    }).toFixed();

    try {
      setApprovalStatus("pending");
      const erc20Contract = new ethers.Contract(
        selectedToken.contractAddress,
        erc20ABI,
        signer as any
      );
      const approvalTx = await erc20Contract.approve(bridgeAddress, convertAmountBN, {
        gasLimit: 500000,
      });
      const approvalReceipt = await approvalTx.wait();
      console.log(approvalReceipt, "approvalReceipt");
      setApprovalStatus("success");
      setTimeout(() => {
        nextStep();
      }, 2000);
    } catch (err) {
      setApprovalStatus("error");
      console.error(err);
    }
  };

  const isLoading = approvalStatus === "pending";
  const isSuccess = approvalStatus === "success";
  const isError = approvalStatus === "error";
  return (
    <div>
      <StepTitle>Token Allowance: Empowering Controlled Asset Transfers</StepTitle>
      <StepDescription style={{ marginBottom: 30 }}>
        Allow the smart contract to spend the specified amount of tokens on your behalf, enabling
        the unwrapping process from the Sidechain to the L1 chain.
      </StepDescription>
      {isLoading && (
        <SpinnerWrapper>
          <Spinner />
          <span>Approving token allowance</span>
        </SpinnerWrapper>
      )}
      {isError && <ErrorMessage role="alert">Ups, something went wrong.</ErrorMessage>}
      {isSuccess && (
        <SuccessWrapper>
          <CheckCircle2 />
          <span>You've successfully approved the bridge to spend your tokens.</span>
        </SuccessWrapper>
      )}
      <Button variant="primary" onClick={onTokenAllowance}>
        Grant token allowance
      </Button>
    </div>
  );
};

export default TokenAllowanceStep;

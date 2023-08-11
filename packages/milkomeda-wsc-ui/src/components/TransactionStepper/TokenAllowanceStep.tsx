import React, { useMemo } from "react";
import {
  ErrorMessage,
  SpinnerWrapper,
  StepDescription,
  StepLargeHeight,
  StepTitle,
} from "./styles";
import {
  erc20ABI,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useContext } from "../ConnectWSC";
import { Spinner } from "../Common/Spinner";
import { ethers } from "ethers";
import { SuccessMessage } from "./WrapStep";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import ThemedButton, { ThemeContainer } from "../Common/ThemedButton";
import { getEvmExplorerUrl } from "../../utils/transactions";

const BRIDGE_DEVNET_ADDRESS = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";
const BRIDGE_MAINNET_ADDRESS = "0xD0Fab4aE1ff28825aabD2A16566f89EB8948F9aB";

const TokenAllowanceStep = ({ nextStep }) => {
  const { tokens } = useContext();
  const { options } = useTransactionConfigWSC();
  const { chain } = useNetwork();

  const selectedToken = useMemo(
    () => tokens.find((t) => t.contractAddress === options.evmTokenAddress),
    [tokens, options.evmTokenAddress]
  );

  const {
    config,
    isLoading: isPreparingLoading,
    isError: isPreparingError,
    error: preparingError,
  } = usePrepareContractWrite({
    address: options.evmTokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      chain?.id === 2001 ? BRIDGE_MAINNET_ADDRESS : BRIDGE_DEVNET_ADDRESS,
      selectedToken != null
        ? ethers.BigNumber.from(selectedToken?.balance)
        : ethers.BigNumber.from(0),
    ],
    enabled: !!selectedToken,
    overrides: {
      gasLimit: ethers.BigNumber.from(500000),
    },
  });

  const {
    data,
    write,
    isLoading: isWritingContract,
    isIdle,
    isError: isContractWriteError,
    error: contractWriteError,
  } = useContractWrite(config);

  const {
    isLoading: isWaitingForTxLoading,
    isSuccess,
    isError: isWaitingForTxError,
    error: waitForTransactionError,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
  });

  const isLoadingTx = isWritingContract || isWaitingForTxLoading;
  const isError = isWaitingForTxError || isContractWriteError || isPreparingError;

  return (
    <>
      <StepLargeHeight>
        <StepTitle>Token Allowance</StepTitle>
        <StepDescription style={{ marginBottom: 30 }}>
          Authorize the seamless transfer of your assets between the EVM and Mainchain networks.
          Perform a token allowance transaction to enable the subsequent unwrapping and secure
          transfer of the asset back to your Mainchain wallet.
        </StepDescription>
        {isPreparingLoading && (
          <SpinnerWrapper>
            <Spinner />
            <span>Preparing transaction</span>
          </SpinnerWrapper>
        )}
        {isLoadingTx && (
          <SpinnerWrapper>
            <Spinner />
            <span>Approving token allowance</span>
          </SpinnerWrapper>
        )}
        {isError && (
          <ErrorMessage role="alert">
            Ups, something went wrong.
            {contractWriteError?.message ?? ""}
            {waitForTransactionError?.message ?? ""}
            {preparingError?.message ?? ""}
          </ErrorMessage>
        )}

        {isSuccess && (
          <>
            <SuccessMessage
              message="You've successfully approved token allowance."
              href={`${getEvmExplorerUrl(chain?.id)}/tx/${data?.hash}`}
              viewLabel="EVM Explorer"
            />
            <ThemeContainer onClick={nextStep}>
              <ThemedButton variant="primary">Continue</ThemedButton>
            </ThemeContainer>
          </>
        )}
      </StepLargeHeight>

      {(isIdle || isError) && (
        <ThemeContainer disabled={!write} onClick={() => write?.()}>
          <ThemedButton variant="primary">Grant token allowance</ThemedButton>
        </ThemeContainer>
      )}
    </>
  );
};

export default TokenAllowanceStep;

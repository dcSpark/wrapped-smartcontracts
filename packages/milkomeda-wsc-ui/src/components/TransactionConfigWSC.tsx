import React, { createContext, createElement } from "react";
import ConnectWSCModal from "./ConnectModal";
import { PrepareWriteContractConfig, PrepareWriteContractResult } from "@wagmi/core";
import { DefaultToken, StepTxDirection } from "./ConnectWSC";

type ContextValue = TransactionConfigWSCProviderProps;

export const TransactionConfigWSCContext = createContext<ContextValue | null>(null);

export type WscSmartContractInfo = {
  address: string;
  abi: PrepareWriteContractResult["abi"];
  functionName: string;
  args: readonly unknown[];
  enabled?: boolean;
  overrides?: PrepareWriteContractConfig["overrides"];
};

export type TransactionConfigWSCOptions = {
  wscSmartContractInfo: WscSmartContractInfo;
  titleModal?: string;
  stepTxDirection?: StepTxDirection;
  evmTokenAddress: string;
  defaultWrapToken: DefaultToken;
  defaultUnwrapToken: DefaultToken;
};

type TransactionConfigWSCProviderProps = {
  children?: React.ReactNode;
  options: TransactionConfigWSCOptions;
};

export const TransactionConfigWSCProvider: React.FC<TransactionConfigWSCProviderProps> = ({
  children,
  options,
}) => {
  if (React.useContext(TransactionConfigWSCContext)) {
    throw new Error(
      "Multiple, nested usages of TransactionConfigWSCProvider detected. Please use only one."
    );
  }

  const defaultOptions = {};

  const opts: TransactionConfigWSCOptions = Object.assign({}, defaultOptions, options);

  const value = {
    options: opts,
  };

  return createElement(
    TransactionConfigWSCContext.Provider,
    { value },
    <>
      {children}
      <ConnectWSCModal />
    </>
  );
};

export const useTransactionConfigWSC = () => {
  const context = React.useContext(TransactionConfigWSCContext);
  if (!context) throw Error("ConnectWSC Hook must be inside a Provider.");
  return context;
};
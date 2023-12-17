// export * as Types from "./types";
export { default as getDefaultConfig } from "./defaultConfig";
export * from "./types";

export { useModal } from "./hooks/useModal";

export { ConnectWSCProvider, Context } from "./components/ConnectWSC";
export {
  TransactionConfigWSCProvider,
  TransactionConfigWSCContext,
} from "./components/TransactionConfigWSC";
export { ConnectWSCButton } from "./components/ConnectButton";
export { useWSCProvider } from "./hooks/useWSCProvider";
export { WSCInterface } from "./components/WSCInterface";
export { CardanoWSCConnector } from "./wsc-cardano-connector";
export { default as supportedConnectors } from "./constants/supportedConnectors";
export { milkomedaChains, supportedWalletNames } from "./defaultConfig";

// Hooks for wsc information
export {
  useGetOriginTokens,
  useGetWSCTokens,
  useGetDestinationBalance,
  useGetPendingTxs,
  useGetOriginAddress,
  useGetAddress,
  useGetOriginBalance,
} from "./hooks/wsc-provider";

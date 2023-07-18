// export * as Types from "./types";
export { default as getDefaultConfig } from "./defaultConfig";

export { useModal } from "./hooks/useModal";

export { ConnectWSCProvider, Context } from "./components/ConnectWSC";
export {
  TransactionConfigWSCProvider,
  TransactionConfigWSCContext,
} from "./components/TransactionConfigWSC";
export { ConnectWSCButton } from "./components/ConnectButton";
export { useWSCProvider } from "./hooks/useWSCProvider";
export { default as supportedConnectors } from "./constants/supportedConnectors";

// Hooks
// export { default as useIsMounted } from "./hooks/useIsMounted"; // Useful for apps that use SSR

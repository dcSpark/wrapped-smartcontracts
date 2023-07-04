// export * as Types from "./types";
export { default as getDefaultConfig } from "./defaultConfig";

export { useModal } from "./hooks/useModal";

export { ConnectWSCProvider, Context } from "./components/ConnectWSC";
export { ConnectWSCButton } from "./components/ConnectButton";
export { useWSCTransactionConfig } from "./hooks/useWSCTransactionConfig";

//export { default as NetworkButton } from './components/NetworkButton';
//export { default as BalanceButton, Balance } from './components/BalanceButton';

// Hooks
// export { default as useIsMounted } from "./hooks/useIsMounted"; // Useful for apps that use SSR
// export { useChains } from "./hooks/useChains";

// TODO: Make this private
export { default as supportedConnectors } from "./constants/supportedConnectors";

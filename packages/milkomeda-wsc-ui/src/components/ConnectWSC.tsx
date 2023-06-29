import React, { createContext, createElement, useEffect, useState, ReactNode } from "react";
import { Buffer } from "buffer";

import defaultTheme from "../styles/defaultTheme";

import ConnectWSCModal from "./ConnectModal";
import { ThemeProvider } from "styled-components";

import { useConnectCallback, useConnectCallbackProps } from "../hooks/useConnectCallback";
import { useAccount } from "wagmi";

export const routes = {
  ONBOARDING: "onboarding",
  CONNECTORS: "connectors",
  MOBILECONNECTORS: "mobileConnectors",
  CONNECT: "connect",
  DOWNLOAD: "download",
  PROFILE: "profile",
};

type Connector = any;
type Error = string | React.ReactNode | null;

type StargateInfo = {
  fromNativeTokenInLoveLaceOrMicroAlgo: string;
  stargateMinNativeTokenFromL1: number;
  stargateMinNativeTokenToL1: number;
  stargateNativeTokenFeeToL1: number;
};
type WSCContext = {
  wscProvider: any;
  originTokens: any;
  tokens: any;
  stargateInfo: StargateInfo | null;
};

type ContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
  connector: string;
  setConnector: React.Dispatch<React.SetStateAction<Connector>>;
  errorMessage: Error;
  options?: ConnectWSCOptions;
  debugMode?: boolean;
  log: (...props: any) => void;
  displayError: (message: string | React.ReactNode | null, code?: any) => void;
} & useConnectCallbackProps &
  WSCContext;

export const Context = createContext<ContextValue | null>(null);

export type ConnectWSCOptions = NonNullable<unknown>;

type ConnectKitProviderProps = {
  children?: React.ReactNode;
  debugMode?: boolean;
} & useConnectCallbackProps;

export const ConnectWSCProvider: React.FC<ConnectKitProviderProps> = ({
  children,
  onConnect,
  onDisconnect,
  debugMode = false,
}) => {
  // Only allow for mounting ConnectKitProvider once, so we avoid weird global
  // state collisions.
  if (React.useContext(Context)) {
    throw new Error(
      "Multiple, nested usages of ConnectWSCProvider detected. Please use only one."
    );
  }

  useConnectCallback({
    onConnect,
    onDisconnect,
  });

  // Default config options
  const defaultOptions: ConnectWSCOptions = {};

  // if (typeof window !== "undefined") {
  // Buffer Polyfill, needed for bundlers that don't provide Node polyfills (e.g CRA, Vite, etc.)
  // window.Buffer = window.Buffer ?? Buffer;

  // Some bundlers may need `global` and `process.env` polyfills as well
  // Not implemented here to avoid unexpected behaviors, but leaving example here for future reference
  /*
   * window.global = window.global ?? window;
   * window.process = window.process ?? { env: {} };
   */
  // }

  const [open, setOpen] = useState<boolean>(false);
  const [connector, setConnector] = useState<string>("");
  const [route, setRoute] = useState<string>(routes.CONNECTORS);
  const [errorMessage, setErrorMessage] = useState<Error>("");

  // wsc connector
  const { connector: activeConnector } = useAccount();
  const [wscProvider, setWscProvider] = React.useState(null);
  const [originTokens, setOriginTokens] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [destinationBalance, setDestinationBalance] = useState(null);
  const [stargateInfo, setStargateInfo] = useState<StargateInfo | null>(null);

  const [originAddress, setOriginAddress] = useState(null);
  const [pendingTxs, setPendingTxs] = useState([]);
  const [address, setAddress] = useState(null);
  const [originBalance, setOriginBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [algorandConnected, setAlgorandConnected] = useState(false);
  const [cardanoConnected, setCardanoConnected] = useState(false);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    if (!activeConnector?.id?.includes("wsc")) return;
    const loadWscProvider = async () => {
      try {
        const provider = await activeConnector.getProvider();
        if (!provider) return;
        const originTokens = await provider.origin_getTokenBalances();
        const tokenBalances = await provider.getTokenBalances();
        const destinationBalance = await provider.eth_getBalance();
        const stargate = await provider.stargateObject();
        console.log("stargate", stargate);
        setWscProvider(provider);
        setOriginTokens(originTokens);
        setTokens(tokenBalances ?? []);
        setDestinationBalance(destinationBalance);
        setStargateInfo(stargate);
      } catch (e) {
        console.log(e);
      }
    };
    loadWscProvider();
  }, [activeConnector, wscProvider]);

  useEffect(() => setErrorMessage(null), [route, open]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const log = debugMode ? console.log : () => {};

  const value = {
    open,
    setOpen,
    route,
    setRoute,
    connector,
    setConnector,
    onConnect,
    // wsc provider
    wscProvider,
    originTokens,
    stargateInfo,
    tokens,
    // Other configuration
    errorMessage,
    debugMode,
    log,
    displayError: (message: string | React.ReactNode | null, code?: any) => {
      setErrorMessage(message);
      console.log("---------CONNECTWSC DEBUG---------");
      console.log(message);
      if (code) console.table(code);
      console.log("---------/CONNECTWSC DEBUG---------");
    },
  };

  return createElement(
    Context.Provider,
    { value },
    <>
      <ThemeProvider theme={defaultTheme}>
        {children}
        <ConnectWSCModal />
      </ThemeProvider>
    </>
  );
};

export const useContext = () => {
  const context = React.useContext(Context);
  if (!context) throw Error("ConnectWSC Hook must be inside a Provider.");
  return context;
};

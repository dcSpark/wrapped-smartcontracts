/* eslint @typescript-eslint/no-explicit-any: "off" */
import React, { createContext, createElement, useEffect, useState } from "react";
// import { Buffer } from "buffer";

import defaultTheme from "../styles/defaultTheme";

import { ThemeProvider } from "styled-components";

import { useConnectCallback, useConnectCallbackProps } from "../hooks/useConnectCallback";
import { useAccount, useQuery } from "wagmi";
import { WSCLib } from "milkomeda-wsc";
import { FunctionKeys } from "../hooks/wsc-provider";

export const routes = {
  ONBOARDING: "onboarding",
  CONNECTORS: "connectors",
  MOBILECONNECTORS: "mobileConnectors",
  CONNECT: "connect",
  DOWNLOAD: "download",
  STEPPER: "steps",
};

type Connector = any;
type Error = string | React.ReactNode | null;

export type DefaultToken = {
  unit: string;
  amount: string;
};

export type StargateInfo = {
  fromNativeTokenInLoveLaceOrMicroAlgo: string;
  stargateMinNativeTokenFromL1: number;
  stargateMinNativeTokenToL1: number;
  stargateNativeTokenFeeToL1: number;
};

export type WSCContext = {
  wscProvider?: WSCLib;
  isWSCConnected: boolean;
};

export type CustomTheme = Record<`--wsc-${string}`, string>;

type ContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
  connector: string;
  setConnector: React.Dispatch<React.SetStateAction<Connector>>;
  errorMessage: Error;
  debugMode?: boolean;
  isWSCConnected?: boolean;
  customTheme?: CustomTheme;
  log: (...props: any) => void;
  displayError: (message: string | React.ReactNode | null, code?: any) => void;
} & useConnectCallbackProps &
  WSCContext;

const getProvider = async (activeConnector: any): Promise<WSCLib> => {
  const provider = await activeConnector.getProvider();
  if (!provider) throw new Error("No wsc provider found");
  return provider;
};

export const Context = createContext<ContextValue | null>(null);

type ConnectKitProviderProps = {
  customTheme?: CustomTheme;
  children?: React.ReactNode;
  debugMode?: boolean;
} & useConnectCallbackProps;

export const ConnectWSCProvider: React.FC<ConnectKitProviderProps> = ({
  children,
  onConnect,
  onDisconnect,
  debugMode = false,
  customTheme = {},
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
  // const defaultOptions: ConnectWSCOptions = {};

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
  // const { chain } = useNetwork();
  const isWSCConnected = activeConnector?.id?.includes("wsc") ?? false;
  const { data: wscProvider } = useQuery(
    [FunctionKeys.WSC_PROVIDER, activeConnector?.id],
    () => getProvider(activeConnector),
    { enabled: isWSCConnected }
  );

  // useEffect(() => setErrorMessage(null), [route, open]);

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
    isWSCConnected,
    // Other configuration
    errorMessage,
    customTheme,
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
    <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
  );
};

export const useContext = () => {
  const context = React.useContext(Context);
  if (!context) throw Error("ConnectWSC Hook must be inside a Provider.");
  return context;
};

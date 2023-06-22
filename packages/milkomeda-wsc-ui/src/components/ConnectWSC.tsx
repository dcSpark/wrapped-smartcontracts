import React, { createContext, createElement, useEffect, useState, ReactNode } from "react";
import { Buffer } from "buffer";

import defaultTheme from "../styles/defaultTheme";

import ConnectWSCModal from "./ConnectModal";
import { ThemeProvider } from "styled-components";
import { useThemeFont } from "../hooks/useGoogleFont";

import { useChains } from "../hooks/useChains";
import { useConnectCallback, useConnectCallbackProps } from "../hooks/useConnectCallback";

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
} & useConnectCallbackProps;

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
  // if (opts.bufferPolyfill) window.Buffer = window.Buffer ?? Buffer;

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

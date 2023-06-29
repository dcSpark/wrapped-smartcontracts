import React from "react";
import { useConnectCallbackProps } from "../hooks/useConnectCallback";
export declare const routes: {
    ONBOARDING: string;
    CONNECTORS: string;
    MOBILECONNECTORS: string;
    CONNECT: string;
    DOWNLOAD: string;
    PROFILE: string;
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
} & useConnectCallbackProps & WSCContext;
export declare const Context: React.Context<ContextValue | null>;
export type ConnectWSCOptions = NonNullable<unknown>;
type ConnectKitProviderProps = {
    children?: React.ReactNode;
    debugMode?: boolean;
} & useConnectCallbackProps;
export declare const ConnectWSCProvider: React.FC<ConnectKitProviderProps>;
export declare const useContext: () => ContextValue;
export {};

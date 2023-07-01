import React from "react";
import { useConnectCallbackProps } from "../hooks/useConnectCallback";
import { WSCLib } from "milkomeda-wsc";
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
export type DefaultCardanoAsset = {
    unit: string;
    amount: number;
};
type StargateInfo = {
    fromNativeTokenInLoveLaceOrMicroAlgo: string;
    stargateMinNativeTokenFromL1: number;
    stargateMinNativeTokenToL1: number;
    stargateNativeTokenFeeToL1: number;
};
type WSCAction = () => Promise<void>;
type WSCContext = {
    wscProvider: WSCLib | null;
    originTokens: any;
    tokens: any;
    stargateInfo: StargateInfo | null;
    defaultCardanoAsset: DefaultCardanoAsset | null;
    setDefaultCardanoAsset: React.Dispatch<React.SetStateAction<DefaultCardanoAsset | null>>;
    contractAddress: string;
    setContractAddress: React.Dispatch<React.SetStateAction<string>>;
    wscAction: WSCAction | null;
    setWscAction: React.Dispatch<React.SetStateAction<WSCAction | null>>;
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

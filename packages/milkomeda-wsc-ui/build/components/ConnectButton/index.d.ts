import React from "react";
import { Chain } from "wagmi";
type Hash = `0x${string}`;
type ConnectButtonRendererProps = {
    children?: (renderProps: {
        show?: () => void;
        hide?: () => void;
        chain?: Chain & {
            unsupported?: boolean;
        };
        unsupported: boolean;
        isConnected: boolean;
        isConnecting: boolean;
        address?: Hash;
        truncatedAddress?: string;
    }) => React.ReactNode;
};
type ConnectKitButtonProps = {
    onClick?: (open: () => void) => void;
};
export declare function ConnectWSCButton({ onClick }: ConnectKitButtonProps): import("react/jsx-runtime").JSX.Element | null;
export declare namespace ConnectWSCButton {
    var Custom: React.FC<ConnectButtonRendererProps>;
}
export {};

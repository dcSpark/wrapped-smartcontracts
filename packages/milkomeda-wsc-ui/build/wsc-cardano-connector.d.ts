import { Connector } from "wagmi";
/**
 * Connector for [Cardano WSC]
 */
export declare class CardanoWSCConnector extends Connector {
    #private;
    id: any;
    readonly name = "WSC";
    readonly ready = true;
    constructor({ chains, options: options_ }: {
        chains: any;
        options: any;
    });
    connect(): Promise<{
        account: any;
        chain: {
            id: number;
            unsupported: boolean;
        };
    }>;
    disconnect(): Promise<void>;
    getAccount(): Promise<any>;
    getChainId(): Promise<number>;
    getProvider(): Promise<any>;
    isAuthorized(): Promise<boolean>;
    getSigner(): Promise<any>;
    onAccountsChanged: (accounts: any) => void;
    onChainChanged: (chainId: any) => void;
    onDisconnect(): void;
}

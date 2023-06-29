import { Connector } from "wagmi";
import { Chain } from "wagmi/chains";
export declare const milkomedaChains: {
    id: number;
    name: string;
    network: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: {
        public: {
            http: string[];
        };
        default: {
            http: string[];
        };
    };
    blockExplorers: {
        etherscan: {
            name: string;
            url: string;
        };
        default: {
            name: string;
            url: string;
        };
    };
}[];
type DefaultConfigProps = {
    autoConnect?: boolean;
    chains?: Chain[];
    connectors?: any;
    provider?: any;
    webSocketProvider?: any;
    enableWebSocketProvider?: boolean;
    stallTimeout?: number;
};
declare const defaultConfig: ({ autoConnect, chains, connectors, provider, stallTimeout, webSocketProvider, enableWebSocketProvider, }: DefaultConfigProps) => {
    autoConnect?: boolean | undefined;
    connectors?: Connector<any, any, any>[] | undefined;
    provider: any;
    webSocketProvider?: any;
};
export default defaultConfig;

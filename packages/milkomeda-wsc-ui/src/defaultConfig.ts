import { Connector, configureChains, ChainProviderFn } from "wagmi";
import { Chain } from "wagmi/chains";

import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { CardanoWSCConnector } from "@dcspark/cardano-wsc-wagmi/dist";

export const milkomedaChains = [
  {
    id: 200101,
    name: "Milkomeda C1 Testnet",
    network: "Milkomeda C1 Testnet",
    nativeCurrency: {
      name: "mTADA",
      symbol: "mTADA",
      decimals: 18,
    },
    rpcUrls: {
      public: { http: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"] },
      default: { http: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"] },
    },
    blockExplorers: {
      etherscan: { name: "", url: "" },
      default: {
        name: "",
        url: "https://explorer-devnet-cardano-evm.c1.milkomeda.com",
      },
    },
  },
  {
    id: 2001,
    name: "Milkomeda C1 Mainnet",
    network: "Milkomeda C1 Mainnet",
    nativeCurrency: {
      name: "mADA",
      symbol: "mADA",
      decimals: 18,
    },
    rpcUrls: {
      public: { http: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"] },
      default: { http: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"] },
    },
    blockExplorers: {
      etherscan: { name: "", url: "" },
      default: {
        name: "",
        url: "https://explorer-mainnet-cardano-evm.c1.milkomeda.com",
      },
    },
  },
];

const defaultChains = [...milkomedaChains];

type DefaultConnectorsProps = {
  chains: Chain[];
};

type DefaultConfigProps = {
  autoConnect?: boolean;
  chains?: Chain[];
  connectors?: any;
  provider?: any;
  webSocketProvider?: any;
  enableWebSocketProvider?: boolean;
  stallTimeout?: number;
};

type MilkomedaWSCClientProps = {
  autoConnect?: boolean;
  connectors?: Connector[];
  provider: any;
  webSocketProvider?: any;
};

const getDefaultConnectors = ({ chains }: DefaultConnectorsProps) => {
  let connectors: Connector[] = [];

  // Add the rest of the connectors
  connectors = [
    ...connectors,
    new CardanoWSCConnector({
      chains,
      options: {
        name: "flint",
        oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
        blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
        jsonRpcProviderUrl: undefined,
      },
    }),
    new CardanoWSCConnector({
      chains,
      options: {
        name: "etrnal",
        oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
        blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
        jsonRpcProviderUrl: undefined,
      },
    }),
  ];

  return connectors;
};

const defaultConfig = ({
  autoConnect = true, // TODO: check why breaks in wsc
  chains = defaultChains,
  connectors,
  provider,
  stallTimeout,
  webSocketProvider,
  enableWebSocketProvider,
}: DefaultConfigProps) => {
  const providers: ChainProviderFn[] = [];

  providers.push(
    jsonRpcProvider({
      rpc: (c) => {
        return { http: c.rpcUrls.default.http[0] };
      },
    })
  );
  providers.push(publicProvider());

  const {
    provider: configuredProvider,
    chains: configuredChains,
    webSocketProvider: configuredWebSocketProvider,
  } = configureChains(chains, providers, { stallTimeout });

  const milkomedaWSCClient: MilkomedaWSCClientProps = {
    autoConnect,
    connectors:
      connectors ??
      getDefaultConnectors({
        chains: configuredChains,
      }),
    provider: provider ?? configuredProvider,
    webSocketProvider: enableWebSocketProvider // Removed by default, breaks if used in Next.js – "unhandledRejection: Error: could not detect network"
      ? webSocketProvider ?? configuredWebSocketProvider
      : undefined,
  };

  return { ...milkomedaWSCClient };
};

export default defaultConfig;

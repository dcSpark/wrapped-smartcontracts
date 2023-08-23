/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Connector, configureChains, ChainProviderFn } from "wagmi";
import { Chain } from "wagmi/chains";

import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { CardanoWSCConnector } from "./wsc-cardano-connector";
import { MilkomedaNetworkName } from "milkomeda-wsc";

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

type SupportedCardanoWallets = "flint" | "eternl" | "nami" | "nufi" | "yoroi";

type DefaultConnectorsProps = {
  chains: Chain[];
  blockfrostId: string;
  oracleUrl: string;
  jsonRpcProviderUrl?: string;
  network?: MilkomedaNetworkName;
  cardanoWalletNames?: SupportedCardanoWallets[];
};

type DefaultConfigProps = {
  autoConnect?: boolean;
  chains?: Chain[];
  connectors?: any;
  provider?: any;
  webSocketProvider?: any;
  enableWebSocketProvider?: boolean;
  stallTimeout?: number;
  blockfrostId: string;
  oracleUrl: string;
  jsonRpcProviderUrl?: string;
  network?: MilkomedaNetworkName;
  cardanoWalletNames?: SupportedCardanoWallets[];
};

type MilkomedaWSCClientProps = {
  autoConnect?: boolean;
  connectors?: Connector[];
  provider: any;
  webSocketProvider?: any;
};

const getDefaultConnectors = ({
  chains,
  blockfrostId,
  oracleUrl,
  jsonRpcProviderUrl,
  network,
  cardanoWalletNames = ["flint", "eternl", "nami", "nufi", "yoroi"],
}: DefaultConnectorsProps) => {
  /* eslint @typescript-eslint/no-explicit-any: "off" */
  let connectors: any[] = [];

  // Add the rest of the connectors
  connectors = [
    ...connectors,
    ...cardanoWalletNames.map(
      (walletName) =>
        new CardanoWSCConnector({
          chains,
          options: {
            name: walletName,
            oracleUrl: oracleUrl,
            blockfrostKey: blockfrostId,
            jsonRpcProviderUrl: jsonRpcProviderUrl,
            network: network ?? MilkomedaNetworkName.C1Devnet,
          },
        })
    ),
  ];

  return connectors;
};

const defaultConfig = ({
  autoConnect = false,
  chains = defaultChains,
  connectors,
  provider,
  stallTimeout,
  webSocketProvider,
  enableWebSocketProvider,
  blockfrostId,
  oracleUrl,
  jsonRpcProviderUrl,
  network,
  cardanoWalletNames,
}: DefaultConfigProps) => {
  const providers: ChainProviderFn[] = [];

  providers.push(
    jsonRpcProvider({
      rpc: (c) => {
        return { http: c.rpcUrls.default.http[0] };
      },
    })
  );
  // providers.push(publicProvider());

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
        blockfrostId: blockfrostId,
        oracleUrl: oracleUrl,
        jsonRpcProviderUrl,
        network,
        cardanoWalletNames,
      }),
    provider: provider ?? configuredProvider,
    webSocketProvider: enableWebSocketProvider // Removed by default, breaks if used in Next.js – "unhandledRejection: Error: could not detect network"
      ? webSocketProvider ?? configuredWebSocketProvider
      : undefined,
  };

  return { ...milkomedaWSCClient };
};

export default defaultConfig;

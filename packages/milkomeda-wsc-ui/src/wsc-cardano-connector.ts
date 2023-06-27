import { Connector, configureChains, ChainProviderFn } from "wagmi";
import { Chain } from "wagmi/chains";

import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { CardanoWSCConnector } from "@dcspark/cardano-wsc-wagmi/dist";

// TODO: use from the npm package
import { WSCLib } from "milkomeda-wsc";
import { MilkomedaNetworkName } from "milkomeda-wsc";
import { ConnectorNotFoundError } from "wagmi";
import { normalizeChainId } from "@wagmi/core";
import { getAddress } from "ethers/lib/utils";

/**
 *
 * Connector for [Cardano WSC]
 */
// type CardanoWSCConnectorOptions = {
//   name: string;
//   network?: MilkomedaNetworkName;
//   oracleUrl?: string;
//   blockfrostKey: string;
//   jsonRpcProviderUrl?: string;
// };
// export class CardanoWSCConnector extends Connector<WSCLib, CardanoWSCConnectorOptions> {
//   readonly ready = true;
//   readonly id;
//   readonly name;
//   #provider;
//   #sdk;
//   #previousProvider;
//   shimDisconnectKey = `${this.id}.shimDisconnect`;
//
//   constructor({ chains, options: options_ }) {
//     const options = {
//       shimDisconnect: false,
//       id: options_.name + "-wsc",
//       ...options_,
//     };
//     console.log("SDK", options);
//     super({ chains, options });
//     this.id = options.id;
//     this.#previousProvider = window?.ethereum;
//     this.#sdk = new WSCLib(MilkomedaNetworkName.C1Devnet, options_.name, {
//       oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
//       blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
//       jsonRpcProviderUrl: undefined,
//     });
//   }
//
//   async connect() {
//     const provider = await this.getProvider();
//     if (!provider) throw new ConnectorNotFoundError();
//
//     if (provider.on) {
//       provider.on("accountsChanged", this.onAccountsChanged);
//       provider.on("chainChanged", this.onChainChanged);
//       provider.on("disconnect", this.onDisconnect);
//     }
//
//     this.emit("message", { type: "connecting" });
//
//     const account = await this.getAccount();
//     const id = await this.getChainId();
//
//     return {
//       account,
//       chain: { id, unsupported: this.isChainUnsupported(id) },
//     };
//   }
//
//   async disconnect() {
//     const provider = await this.getProvider();
//     // switch back to previous provider
//     window.ethereum = this.#previousProvider;
//
//     if (!provider?.removeListener) return;
//     provider.removeListener("accountsChanged", this.onAccountsChanged);
//     provider.removeListener("chainChanged", this.onChainChanged);
//     provider.removeListener("disconnect", this.onDisconnect);
//   }
//
//   async getAccount() {
//     const provider = await this.getProvider();
//     if (!provider) throw new ConnectorNotFoundError();
//     const account = await this.#provider.eth_getAccount();
//     return account;
//   }
//
//   async getChainId() {
//     const provider = await this.getProvider();
//     if (!provider) throw new ConnectorNotFoundError();
//     return normalizeChainId(200101); // TODO: didn't find the network id from provider
//   }
//
//   async getProvider() {
//     console.log("provider-1!");
//     if (!this.#provider) {
//       const wsc = await this.#sdk.inject();
//       if (!wsc) throw new Error("Could not load WSC information");
//       this.#provider = wsc;
//     }
//     return this.#provider;
//   }
//
//   async getSigner() {
//     const provider = await this.getProvider();
//     return (await provider.getEthersProvider()).getSigner();
//   }
//
//   async isAuthorized() {
//     try {
//       const account = await this.getAccount();
//       return !!account;
//     } catch {
//       return false;
//     }
//   }
//
//   onAccountsChanged = (accounts) => {
//     if (accounts.length === 0) this.emit("disconnect");
//     else
//       this.emit("change", {
//         account: getAddress(accounts[0]),
//       });
//   };
//
//   onChainChanged = (chainId) => {
//     const id = normalizeChainId(chainId);
//     const unsupported = this.isChainUnsupported(id);
//     this.emit("change", { chain: { id, unsupported } });
//   };
//
//   onDisconnect() {
//     this.emit("disconnect");
//   }
// }

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new CardanoWSCConnector({
      chains,
      options: {
        name: "flint",
        oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
        blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
        jsonRpcProviderUrl: undefined,
      },
    }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // new CardanoWSCConnector({
    //   chains,
    //   options: {
    //     name: "etrnal",
    //     oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
    //     blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
    //     jsonRpcProviderUrl: undefined,
    //   },
    // }),
  ];

  return connectors;
};

const defaultConfig = ({
  autoConnect = true,
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

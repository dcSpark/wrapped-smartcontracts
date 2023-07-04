import type { Chain } from "@wagmi/chains";
import { WSCLib, MilkomedaNetworkName } from "milkomeda-wsc";
import { Connector, ConnectorNotFoundError } from "wagmi";
import { normalizeChainId } from "@wagmi/core";
// import { getAddress } from "ethers/lib/utils.js";

type CardanoWSCConnectorOptions = {
  name: string;
  network?: MilkomedaNetworkName;
  oracleUrl?: string;
  blockfrostKey: string;
  jsonRpcProviderUrl?: string;
};
/**
 * Connector for [Cardano WSC]
 */
export class CardanoWSCConnector extends Connector<WSCLib, CardanoWSCConnectorOptions> {
  readonly ready = true;
  readonly id;
  readonly name;
  #provider?: any;
  #sdk;
  #previousEVMProvider;
  #previousCardanoProvider;

  constructor({
    chains,
    options: options_,
  }: {
    chains: Chain[];
    options: CardanoWSCConnectorOptions;
  }) {
    const options = {
      id: options_.name + "-wsc",
      ...options_,
    };
    super({ chains, options });
    this.id = options.id;
    this.name = options.name;

    if (typeof window === "undefined") return;
    this.#previousEVMProvider = window?.ethereum;
    this.#previousCardanoProvider = window?.cardano;

    const network = options_.network ?? MilkomedaNetworkName.C1Devnet;
    this.#sdk = new WSCLib(network, options_.name, {
      oracleUrl: options_.oracleUrl,
      blockfrostKey: options_.blockfrostKey,
      jsonRpcProviderUrl: options_.jsonRpcProviderUrl,
    });
  }

  async connect(): Promise<any> {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();

    if (provider.on) {
      provider.on("accountsChanged", this.onAccountsChanged);
      provider.on("chainChanged", this.onChainChanged);
      provider.on("disconnect", this.onDisconnect);
    }

    this.emit("message", { type: "connecting" });

    const account = await this.getAccount();
    const id = await this.getChainId();

    return {
      account,
      chain: { id, unsupported: this.isChainUnsupported(id) },
    };
  }

  async disconnect() {
    const provider = await this.getProvider();
    // switch back to previous provider
    window.ethereum = this.#previousEVMProvider;
    window.cardano = this.#previousCardanoProvider as any;

    if (!provider?.removeListener) return;
    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
    provider.removeListener("disconnect", this.onDisconnect);
  }

  async getAccount() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const account = await this.#provider?.eth_getAccount();
    return account as any;
  }

  async getChainId() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return normalizeChainId(200101);
  }

  async getProvider() {
    if (!this.#provider) {
      const wsc = await this.#sdk?.inject();
      if (!wsc) throw new Error("Could not load WSC information");
      this.#provider = wsc;
    }
    return this.#provider;
  }

  async getSigner() {
    const provider = await this.getProvider();
    return (await provider.getEthersProvider()).getSigner();
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit("disconnect");
    else
      this.emit("change", {
        account: "0x",
      });
  };

  onChainChanged = (chainId: number | string) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  };

  onDisconnect() {
    this.emit("disconnect");
  }
}

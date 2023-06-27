import { WSCLib } from "milkomeda-wsc";
import { MilkomedaNetworkName } from "milkomeda-wsc";
import { Connector, ConnectorNotFoundError } from "wagmi";
import { normalizeChainId } from "@wagmi/core";
import { getAddress } from "ethers/lib/utils";

/**
 * Connector for [Cardano WSC]
 */
export class CardanoWSCConnector extends Connector {
  id;
  readonly name = "WSC";
  readonly ready = true;
  #provider;
  #sdk;
  #previousProvider;

  constructor({ chains, options: options_ }) {
    const options = {
      shimDisconnect: false,
      id: options_.name + "-wsc",
      ...options_,
    };
    super({ chains, options });
    this.id = options.id;
    if (typeof window === "undefined") return;
    this.#previousProvider = window?.ethereum;
    this.#sdk = new WSCLib(MilkomedaNetworkName.C1Devnet, options_.name, {
      oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
      blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
      jsonRpcProviderUrl: undefined,
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async connect() {
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
    window.ethereum = this.#previousProvider;

    if (!provider?.removeListener) return;
    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
    provider.removeListener("disconnect", this.onDisconnect);
  }

  async getAccount() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const account = await provider.eth_getAccount();
    return account;
  }

  async getChainId() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return normalizeChainId(200101); // TODO: didn't find the network id from provider
  }

  async getProvider() {
    console.log("#wsc", this.#sdk, this.#provider);
    if (!this.#provider) {
      const wsc = await this.#sdk.inject();
      if (!wsc) throw new Error("Could not load WSC information");
      this.#provider = wsc;
    }
    return this.#provider;
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }
  async getSigner() {
    const provider = await this.getProvider();
    return (await provider.getEthersProvider()).getSigner();
  }

  onAccountsChanged = (accounts) => {
    if (accounts.length === 0) this.emit("disconnect");
    else
      this.emit("change", {
        account: getAddress(accounts[0]),
      });
  };

  onChainChanged = (chainId) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  };

  onDisconnect() {
    this.emit("disconnect");
  }
}

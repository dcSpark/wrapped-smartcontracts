import { PeraWalletConnect } from "@perawallet/connect";
import EventEmitter from "events";
import algorandMethods from "./algorandMethods/index";
import cardanoMethods from "./cardanoMethods/index";
import { ProviderRpcError } from "./errors";
import { CustomMethod, MilkomedaProvider, RequestArguments } from "./types";

export const PROVIDER_TYPES = {
  CARDANO: "cardano",
  ALGORAND: "algorand",
} as const;
export type ProviderType = typeof PROVIDER_TYPES[keyof typeof PROVIDER_TYPES];

class Provider extends EventEmitter implements MilkomedaProvider {
  private readonly methods: { [key: string]: CustomMethod };

  public readonly peraWallet: PeraWalletConnect | undefined;
  public algorandAccounts: string[] = [];

  public readonly isMilkomeda = true;

  public actorFactoryAddress: string | undefined = undefined;

  private nextId = 1;

  constructor(
    private readonly oracleUrl: string,
    private readonly jsonRpcProviderUrl: string,
    type: ProviderType
  ) {
    super();

    switch (type) {
      case PROVIDER_TYPES.CARDANO:
        this.methods = cardanoMethods;
        break;
      case PROVIDER_TYPES.ALGORAND:
        this.methods = algorandMethods;
        this.peraWallet = new PeraWalletConnect();
        break;
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  async setup(): Promise<void> {
    this.actorFactoryAddress = await this.jsonRpcRequest(this.oracleUrl, {
      method: "eth_actorFactoryAddress",
      params: [],
    });

    this.emit("connect");
  }

  async request(payload: RequestArguments): Promise<unknown> {
    if (payload.method in this.methods) {
      return this.methods[payload.method](this, payload);
    }

    return this.providerRequest(payload);
  }

  async oracleRequest<T>(payload: RequestArguments): Promise<T> {
    return this.jsonRpcRequest<T>(this.oracleUrl, payload);
  }

  async providerRequest<T>(payload: RequestArguments): Promise<T> {
    return this.jsonRpcRequest<T>(this.jsonRpcProviderUrl, payload);
  }

  private async jsonRpcRequest<T>(url: string, payload: RequestArguments): Promise<T> {
    const reponse = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: this.nextId++,
        method: payload.method,
        params: payload.params,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { result, error } = await reponse.json();

    if (error) {
      throw new ProviderRpcError(error.message, error.code, error.data);
    }

    return result;
  }
}

export default Provider;

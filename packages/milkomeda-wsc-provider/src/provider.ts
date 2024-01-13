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
export type ProviderType = (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];

/**
 * A wrapper for EIP-1193
 * On top of its custom functions, you can use it as a standard EIP-1193 object
 * ```ts
 * await wscProvider.request({
 *     method: "eth_requestAccounts",
 *     params: [],
 * })
 * ```
 */
class Provider extends EventEmitter implements MilkomedaProvider {
  private readonly methods: { [key: string]: CustomMethod };

  public readonly peraWallet: PeraWalletConnect | undefined;
  public algorandAccounts: string[] = [];

  public readonly isMilkomeda = true;

  public actorVersion: number | undefined = undefined;
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

  async setup(actorVersion?: number): Promise<void> {
    this.actorFactoryAddress = await this.jsonRpcRequest(this.oracleUrl, {
      method: "eth_actorFactoryAddress",
      params: [actorVersion],
    });
    this.actorVersion = actorVersion;

    // required to emit `connect` as per EIP1193
    // https://eips.ethereum.org/EIPS/eip-1193#connect-1
    // note: although the spec says this is required, it looks like this isn't well supported:
    // 1) Some providers like MetaMask follow the spec (https://github.com/MetaMask/providers/blob/126a8c868785eb088511769cd532a72072662369/src/BaseProvider.ts#L323)
    // 2) Some emit the event without a chainID (https://github.com/floating/eth-provider/blob/69184e9b4101e09e39dd391aef5b1c620a63e147/connections/ws.js#L41)
    // 3) Some emit no event at all (seemingly HardHat as of Jan 2024)
    const chainId = (await this.request({
      method: "eth_chainId",
    })) as string;
    this.emit("connect", { chainId });
  }

  async changeActorVersion(actorVersion: number): Promise<void> {
    await this.setup(actorVersion);
  }

  /**
   * request method from EIP-1193
   * https://eips.ethereum.org/EIPS/eip-1193#request-1
   */
  async request(payload: RequestArguments): Promise<unknown> {
    // 1) Check if this is a method that requires special support to work with WSC
    if (payload.method in this.methods) {
      return this.methods[payload.method](this, payload);
    }
    // 2) Otherwise, just forward it to the underlying provider
    return this.providerRequest(payload);
  }

  async oracleRequest<T>(payload: RequestArguments): Promise<T> {
    return this.jsonRpcRequest<T>(this.oracleUrl, payload);
  }

  async providerRequest<T>(payload: RequestArguments): Promise<T> {
    return this.jsonRpcRequest<T>(this.jsonRpcProviderUrl, payload);
  }

  /**
   * Implementation of the JSON-RPC API
   * See https://eips.ethereum.org/EIPS/eip-1474
   */
  private async jsonRpcRequest<T>(url: string, payload: RequestArguments): Promise<T> {
    const response = await fetch(url, {
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

    const { result, error } = await response.json();

    if (error) {
      throw new ProviderRpcError(error.message, error.code, error.data);
    }

    return result;
  }
}

export default Provider;

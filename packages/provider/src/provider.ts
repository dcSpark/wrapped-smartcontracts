import type { CardanoProvider, MilkomedaProvider, RequestArguments } from "./types";
import methods from "./methods/index";

class Provider implements MilkomedaProvider {
  public readonly isMilkomeda = true;
  public readonly cardanoProvider: CardanoProvider | undefined;
  public actorFactoryAddress: string;

  private nextId = 1;

  constructor(private readonly oracleUrl: string, private readonly jsonRpcProviderUrl: string) {
    if (!window.cardano) {
      throw new Error("Cardano provider not found");
    }

    this.cardanoProvider = window.cardano;
  }

  async setup(): Promise<void> {
    this.actorFactoryAddress = await this.jsonRpcRequest(this.oracleUrl, {
      method: "eth_actorFactoryAddress",
      params: [],
    });
  }

  async request(payload: RequestArguments): Promise<unknown> {
    if (payload.method in methods) {
      return methods[payload.method](this, payload);
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
      throw new Error(result);
    }

    return result;
  }
}

export default Provider;

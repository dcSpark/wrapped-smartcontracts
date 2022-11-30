import { CardanoProvider, MilkomedaProvider, RequestArguments } from "./types";
import methods from "./methods/index";

class Provider implements MilkomedaProvider {
  public readonly isMilkomeda = true;
  public readonly cardanoProvider: CardanoProvider | undefined;

  private nextId = 1;

  constructor(private readonly oracleUrl: string, public readonly actorFactoryAddress: string) {
    if (!window.cardano) {
      throw new Error("Cardano provider not found");
    }

    this.cardanoProvider = window.cardano;
  }

  async request(payload: RequestArguments): Promise<unknown> {
    if (payload.method in methods) {
      return methods[payload.method](this, payload);
    }

    return this.fallback(payload);
  }

  private async fallback(payload: RequestArguments): Promise<unknown> {
    const reponse = await fetch(this.oracleUrl, {
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

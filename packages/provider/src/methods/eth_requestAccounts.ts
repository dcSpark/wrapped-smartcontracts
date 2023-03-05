import { Buffer } from "buffer";
import { CustomMethod, MilkomedaProvider } from "../types";
import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { getActorAddress } from "../utils";
import { JSON_RPC_ERROR_CODES, ProviderRpcError } from "../errors";

/**
 * @dev Requests cardano address from injected cardano provider and transforms it to the Actor address
 */
const eth_requestAccounts: CustomMethod = async (provider: MilkomedaProvider) => {
  const { cardanoProvider, actorFactoryAddress } = provider;

  if (actorFactoryAddress === undefined) {
    throw new ProviderRpcError(
      "Actor factory address not set. Run setup() first.",
      JSON_RPC_ERROR_CODES.DISCONNECTED
    );
  }

  try {
    await cardanoProvider.enable();

    const address = await cardanoProvider.getChangeAddress();

    const bech32Address = Address.from_bytes(Buffer.from(address, "hex")).to_bech32();

    return [await getActorAddress(provider, bech32Address)];
  } catch (e) {
    throw new ProviderRpcError("Failed to get accounts", JSON_RPC_ERROR_CODES.INTERNAL_ERROR, e);
  }
};

export default eth_requestAccounts;

import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { CustomMethod, MilkomedaProvider, RequestArguments } from "../types";
import { encodePayload, getActorAddress } from "../utils";
import { Buffer } from "buffer";
import { z, ZodError } from "zod";
import { JSON_RPC_ERROR_CODES, ProviderRpcError } from "../errors";

const InputSchema = z.tuple([
  z.object({
    from: z.string(),
    to: z.string(),
    gas: z.string(),
    gasPrice: z.string().optional(),
    value: z.string().optional(),
    data: z.string().optional(),
    nonce: z.string().optional(),
  }),
]);

/**
 * @dev Wraps the eth transaction to the Actor transaction, signs using cardano provider
 * and sends it to the oracle.
 */
const eth_sendTransaction: CustomMethod = async (
  provider: MilkomedaProvider,
  { params }: RequestArguments
) => {
  const { cardanoProvider, actorFactoryAddress } = provider;

  if (actorFactoryAddress === undefined) {
    throw new ProviderRpcError(
      "Actor factory address not set. Run setup() first.",
      JSON_RPC_ERROR_CODES.DISCONNECTED
    );
  }

  try {
    const [transaction] = InputSchema.parse(params);

    const { from, to, value, data, nonce, gas: gasLimit, gasPrice: gasPriceArg } = transaction;

    const actorNonce =
      nonce ?? (await provider.oracleRequest({ method: "eth_getActorNonce", params: [from] }));

    if (actorNonce === undefined) {
      throw new ProviderRpcError("Invalid nonce", JSON_RPC_ERROR_CODES.INVALID_PARAMS);
    }

    const gasPrice = gasPriceArg ?? (await provider.providerRequest({ method: "eth_gasPrice" }));

    if (gasPrice === undefined) {
      throw new ProviderRpcError("Invalid gas price", JSON_RPC_ERROR_CODES.INVALID_PARAMS);
    }

    const cardanoAddress = await cardanoProvider.getChangeAddress();
    const bech32Address = Address.from_bytes(Buffer.from(cardanoAddress, "hex")).to_bech32();

    if (from.toUpperCase() !== (await getActorAddress(provider, bech32Address)).toUpperCase()) {
      throw new ProviderRpcError("Invalid from address", JSON_RPC_ERROR_CODES.INVALID_PARAMS);
    }

    const payload = encodePayload({
      nonce: actorNonce,
      to,
      value: value ?? 0,
      gasLimit,
      gasPrice,
      calldata: data ?? [],
    });

    const signedTransaction = await cardanoProvider.signData(bech32Address, payload.slice(2));

    return await provider.oracleRequest({
      method: "eth_sendActorTransaction",
      params: [signedTransaction],
    });
  } catch (e) {
    if (e instanceof ProviderRpcError) {
      throw e;
    }

    if (e instanceof ZodError) {
      throw new ProviderRpcError("Invalid input", JSON_RPC_ERROR_CODES.INVALID_PARAMS, e);
    }

    throw new ProviderRpcError(
      "Failed to send transaction",
      JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
      e
    );
  }
};

export default eth_sendTransaction;

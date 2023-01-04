import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { ethers } from "ethers";
import { CustomMethod, MilkomedaProvider, RequestArguments } from "../types";
import { getActorAddress } from "../utils";
import { Buffer } from "buffer";
import { z, ZodError } from "zod";
import { JSON_RPC_ERROR_CODES, ProviderRpcError } from "../errors";

const InputSchema = z.tuple([
  z.object({
    from: z.string(),
    to: z.string(),
    gas: z.string().optional(),
    gasPrice: z.string().optional(),
    value: z.string().optional(),
    data: z.string().optional(),
    nonce: z.string().optional(),
  }),
]);

const eth_sendTransaction: CustomMethod = async (
  provider: MilkomedaProvider,
  { params }: RequestArguments
) => {
  if (provider.actorFactoryAddress === undefined) {
    throw new ProviderRpcError(
      "Actor factory address not set. Run setup() first.",
      JSON_RPC_ERROR_CODES.DISCONNECTED
    );
  }

  try {
    const { cardanoProvider, actorFactoryAddress } = provider;

    const [transaction] = InputSchema.parse(params);

    const { from, to, value, data, nonce } = transaction;

    const actorNonce =
      nonce ?? (await provider.oracleRequest({ method: "eth_getActorNonce", params: [from] }));

    const cardanoAddress = await cardanoProvider.getChangeAddress();
    const bech32Address = Address.from_bytes(Buffer.from(cardanoAddress, "hex")).to_bech32();

    if (from.toUpperCase() !== getActorAddress(actorFactoryAddress, bech32Address).toUpperCase()) {
      throw new Error("Invalid from address");
    }

    const payload = ethers.utils.defaultAbiCoder
      .encode(["uint256", "address", "uint256", "bytes"], [actorNonce, to, value ?? 0, data ?? []])
      .slice(2);

    const signedTransaction = await cardanoProvider.signData(bech32Address, payload);

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

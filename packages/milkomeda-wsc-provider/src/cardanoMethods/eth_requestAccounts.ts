import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import { z, ZodError } from "zod";
import { JSON_RPC_ERROR_CODES, ProviderRpcError } from "../errors";
import { CustomMethod, MilkomedaProvider, RequestArguments } from "../types";
import { getActorAddress } from "../utils";

const InputSchema = z
  .union([
    z.tuple([]),
    z.tuple([
      z.string().refine((salt) => ethers.utils.isHexString(salt, 32), { message: "Invalid salt" }),
    ]),
  ])
  .optional();

/**
 * @dev Requests Cardano address from injected Cardano provider and transforms it to the Actor address
 */
const eth_requestAccounts: CustomMethod = async (
  provider: MilkomedaProvider,
  { params }: RequestArguments
) => {
  const { actorFactoryAddress } = provider;

  if (actorFactoryAddress === undefined) {
    throw new ProviderRpcError(
      "Actor factory address not set. Run setup() first.",
      JSON_RPC_ERROR_CODES.DISCONNECTED
    );
  }

  if (window.cardano === undefined) {
    throw new Error("Cardano provider not found");
  }

  try {
    const [salt] = InputSchema.parse(params) ?? [];

    await window.cardano.enable();

    const address = await window.cardano.getChangeAddress();

    const bech32Address = Address.from_bytes(Buffer.from(address, "hex")).to_bech32();

    return [await getActorAddress(provider, bech32Address, salt)];
  } catch (e) {
    console.log(e);
    if (e instanceof ZodError) {
      throw new ProviderRpcError("Invalid input", JSON_RPC_ERROR_CODES.INVALID_PARAMS, e);
    }

    throw new ProviderRpcError("Failed to get accounts", JSON_RPC_ERROR_CODES.INTERNAL_ERROR, e);
  }
};

export default eth_requestAccounts;

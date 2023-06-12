import { ethers } from "ethers";
import { z, ZodError } from "zod";
import { JSON_RPC_ERROR_CODES, ProviderRpcError } from "../errors";
import { CustomMethod, MilkomedaProvider, RequestArguments } from "../types";
import { getActorAddress } from "../utils";

const InputSchema = z.union([
  z.tuple([]),
  z.tuple([
    z.string().refine((salt) => ethers.utils.isHexString(salt, 32), { message: "Invalid salt" }),
  ]),
]);

/**
 * @dev Requests cardano address from the algorand wallet and transforms it to the Actor address
 */
const eth_accounts: CustomMethod = async (
  provider: MilkomedaProvider,
  { params }: RequestArguments
) => {
  const { actorFactoryAddress, peraWallet, algorandAccounts } = provider;

  if (actorFactoryAddress === undefined) {
    throw new ProviderRpcError(
      "Actor factory address not set. Run setup() first.",
      JSON_RPC_ERROR_CODES.DISCONNECTED
    );
  }

  if (peraWallet === undefined) {
    throw new ProviderRpcError(
      "PeraWalletConnect setup failed",
      JSON_RPC_ERROR_CODES.DISCONNECTED
    );
  }

  try {
    if (!peraWallet.isConnected || algorandAccounts.length === 0) return [];

    const [salt] = InputSchema.parse(params);

    const [address] = algorandAccounts;

    return [await getActorAddress(provider, address, salt)];
  } catch (e) {
    console.log(e);
    if (e instanceof ZodError) {
      throw new ProviderRpcError("Invalid input", JSON_RPC_ERROR_CODES.INVALID_PARAMS, e);
    }

    throw new ProviderRpcError("Failed to get accounts", JSON_RPC_ERROR_CODES.INTERNAL_ERROR, e);
  }
};

export default eth_accounts;

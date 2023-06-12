import algosdk from "algosdk";
import { ethers } from "ethers";
import { z, ZodError } from "zod";
import { JSON_RPC_ERROR_CODES, ProviderRpcError } from "../errors";
import { CustomMethod, MilkomedaProvider, RequestArguments } from "../types";
import { encodePayload, getActorAddress } from "../utils";

const TransactionSchema = z.object({
  from: z.string(),
  to: z.string(),
  gas: z.string(),
  gasPrice: z.string().optional(),
  value: z.string().optional(),
  data: z.string().optional(),
  nonce: z.string().optional(),
});

const InputSchema = z.union([
  z.tuple([TransactionSchema]),
  z.tuple([
    TransactionSchema,
    z.string().refine((salt) => ethers.utils.isHexString(salt, 32), { message: "Invalid salt" }),
  ]),
]);

/**
 * @dev Wraps the eth transaction to the Actor transaction, signs using algorand wallet
 * and sends it to the oracle.
 */
const eth_sendTransaction: CustomMethod = async (
  provider: MilkomedaProvider,
  { params }: RequestArguments
) => {
  const { actorFactoryAddress, peraWallet } = provider;

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
    const [transaction, salt] = InputSchema.parse(params);

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

    const [algorandAddress] =
      provider.algorandAccounts.length === 0
        ? await peraWallet.connect()
        : provider.algorandAccounts;

    if (
      from.toUpperCase() !== (await getActorAddress(provider, algorandAddress, salt)).toUpperCase()
    ) {
      throw new ProviderRpcError("Invalid from address", JSON_RPC_ERROR_CODES.INVALID_PARAMS);
    }

    const payload = encodePayload({
      from,
      nonce: actorNonce,
      to,
      value: value ?? 0,
      gasLimit,
      gasPrice,
      calldata: data ?? [],
    });

    const algorandZeroTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: algorandAddress,
      to: algorandAddress,
      amount: 0,
      note: new Uint8Array(Buffer.from(payload.slice(2), "hex")),
      suggestedParams: {
        fee: 0,
        flatFee: true,
        firstRound: 1,
        lastRound: 1,
        genesisID: "",
        genesisHash: "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8",
      },
    });

    const [signedTransaction] = await peraWallet.signTransaction([
      [{ txn: algorandZeroTx, signers: [algorandAddress] }],
    ]);

    const l2TxPayload = {
      signature: Buffer.from(signedTransaction).toString("hex"),
      key: Buffer.from(algosdk.decodeAddress(algorandAddress).publicKey).toString("hex"),
    };

    return await provider.oracleRequest({
      method: "eth_sendAlgActorTransaction",
      params: [l2TxPayload, salt].filter(Boolean),
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

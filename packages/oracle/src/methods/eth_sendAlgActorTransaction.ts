import algosdk from "algosdk";
import { ethers } from "ethers";
import { JSONRPCErrorCode, JSONRPCErrorException } from "json-rpc-2.0";
import { z } from "zod";
import config from "../config";
import { MINIMAL_GAS_LIMIT } from "../const";
import {
  actorFactory,
  attachActor,
  decodePayload,
  getActorAddress,
  isActorDeployed,
} from "../services/actor.service";
import { verifySignature } from "../services/algorand.service";
import { provider, wallet } from "../services/blockchain.service";
import eth_getActorNonce from "./eth_getActorNonce";
import validationMiddleware from "./validationMiddleware";

const validateTransaction = async (
  signature: Buffer,
  key: Buffer,
  salt?: ethers.BytesLike
): Promise<{
  actorAddress: string;
  mainchainAddress: string;
  gasLimit: ethers.BigNumberish;
  gasPrice: ethers.BigNumberish;
  isDeployed: boolean;
}> => {
  const mainchainAddress = algosdk.encodeAddress(new Uint8Array(key));

  const signedTx = algosdk.decodeSignedTransaction(new Uint8Array(signature));

  if (!verifySignature(signedTx, key, mainchainAddress)) {
    throw new JSONRPCErrorException("Invalid signature", JSONRPCErrorCode.InvalidRequest);
  }

  const payload = signedTx.txn.note;

  if (payload === undefined) {
    throw new JSONRPCErrorException("Invalid payload", JSONRPCErrorCode.InvalidRequest);
  }

  const { from, to, nonce, value, gasLimit, gasPrice } = decodePayload(payload);

  const actorAddress = await getActorAddress(mainchainAddress, salt);

  if (from !== actorAddress) {
    throw new JSONRPCErrorException(
      "Invalid actor address or salt",
      JSONRPCErrorCode.InvalidRequest
    );
  }

  if (to === ethers.constants.AddressZero) {
    throw new JSONRPCErrorException("Invalid recipient address", JSONRPCErrorCode.InvalidRequest);
  }

  const isDeployed = await isActorDeployed(actorAddress);

  // With small gas limit, the transaction will probably fail
  if ((gasLimit as ethers.BigNumber).lt(MINIMAL_GAS_LIMIT)) {
    throw new JSONRPCErrorException(
      `Gas limit too low, minimal limit ${MINIMAL_GAS_LIMIT}`,
      JSONRPCErrorCode.InvalidRequest
    );
  }

  const balance = await provider.getBalance(actorAddress);

  const gasFee = ethers.BigNumber.from(gasLimit).mul(gasPrice);

  const requiredBalance = gasFee.add(value);

  if (balance.lt(requiredBalance)) {
    throw new JSONRPCErrorException(
      "Gas limit + txValue exceeds the actor balance",
      JSONRPCErrorCode.InvalidRequest
    );
  }

  const actorNonce = await eth_getActorNonce([actorAddress]);

  if (!ethers.BigNumber.from(actorNonce).eq(nonce)) {
    throw new JSONRPCErrorException(
      `Invalid nonce, expected: ${actorNonce} got: ${nonce.toString()}`,
      JSONRPCErrorCode.InvalidRequest
    );
  }

  return { actorAddress, mainchainAddress, gasLimit, gasPrice, isDeployed };
};

const SignedTransactionSchema = z.object({
  key: z.string().transform((key) => Buffer.from(key, "hex")),
  signature: z.string().transform((signature) => Buffer.from(signature, "hex")),
});

const InputSchema = z.union([
  z.tuple([SignedTransactionSchema]),
  z.tuple([
    SignedTransactionSchema,
    z
      .string()
      .optional()
      .refine((salt) => ethers.utils.isHexString(salt, 32), { message: "Invalid salt" }),
  ]),
]);

const eth_sendAlgActorTransaction = async ([{ signature, key }, salt]: z.infer<
  typeof InputSchema
>) => {
  // Pre-validate transaction to not waste gas on invalid transactions
  const { actorAddress, mainchainAddress, gasLimit, gasPrice, isDeployed } =
    await validateTransaction(signature, key, salt);

  if (isDeployed) {
    const actor = attachActor(actorAddress);

    const tx = config.actorDebugMode
      ? await actor.connect(wallet).debug(signature, key, { gasLimit, gasPrice })
      : await actor.connect(wallet).execute(signature, key, { gasLimit, gasPrice });

    return tx.hash;
  } else {
    const tx = await actorFactory
      .connect(wallet)
      .deployAndExecute(mainchainAddress, ethers.constants.HashZero, signature, key, gasLimit, {
        gasLimit: ethers.BigNumber.from(gasLimit).add(1_000_000),
        gasPrice,
      });

    return tx.hash;
  }
};

export default validationMiddleware(InputSchema.parse, eth_sendAlgActorTransaction);

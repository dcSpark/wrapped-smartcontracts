import { Address } from "@dcspark/cardano-multiplatform-lib-nodejs";
import { COSEKey, COSESign1 } from "@emurgo/cardano-message-signing-nodejs";
import { ethers } from "ethers";
import { JSONRPCErrorCode, JSONRPCErrorException } from "json-rpc-2.0";
import { z } from "zod";
import { MINIMAL_GAS_LIMIT } from "../const";
import {
  actorFactory,
  attachActor,
  decodePayload,
  getActorAddress,
  isActorDeployed,
} from "../services/actor.service";
import { provider, wallet } from "../services/blockchain.service";
import { getMainchainAddressFromSignature, verifySignature } from "../services/cardano.service";
import eth_getActorNonce from "./eth_getActorNonce";
import validationMiddleware from "./validationMiddleware";

const validateTransaction = async (
  coseSign1: COSESign1,
  coseKey: COSEKey,
  salt?: ethers.BytesLike
): Promise<{
  actorAddress: string;
  mainchainAddress: Address;
  gasLimit: ethers.BigNumberish;
  gasPrice: ethers.BigNumberish;
  isDeployed: boolean;
}> => {
  const mainchainAddress = getMainchainAddressFromSignature(coseSign1);

  if (!verifySignature(coseSign1, coseKey, mainchainAddress)) {
    throw new JSONRPCErrorException("Invalid signature", JSONRPCErrorCode.InvalidRequest);
  }

  const payload = coseSign1.payload();

  if (payload === undefined) {
    throw new JSONRPCErrorException("Invalid payload", JSONRPCErrorCode.InvalidRequest);
  }

  const { from, to, nonce, value, gasLimit, gasPrice } = decodePayload(payload);

  const actorAddress = await getActorAddress(mainchainAddress.to_bech32(), salt);

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

const eth_sendActorTransaction = async ([{ signature, key }, salt]: z.infer<
  typeof InputSchema
>) => {
  const coseSign1 = COSESign1.from_bytes(signature);
  const coseKey = COSEKey.from_bytes(key);

  // Pre-validate transaction to not waste gas on invalid transactions
  const { actorAddress, mainchainAddress, gasLimit, gasPrice, isDeployed } =
    await validateTransaction(coseSign1, coseKey, salt);

  if (isDeployed) {
    const actor = attachActor(actorAddress);

    const tx = await actor.connect(wallet).execute(signature, key, { gasLimit, gasPrice });

    return tx.hash;
  } else {
    const tx = await actorFactory
      .connect(wallet)
      .deployAndExecute(
        mainchainAddress.to_bech32(),
        ethers.constants.HashZero,
        signature,
        key,
        gasLimit,
        {
          gasLimit: ethers.BigNumber.from(gasLimit).add(1_000_000),
          gasPrice,
        }
      );

    return tx.hash;
  }
};

export default validationMiddleware(InputSchema.parse, eth_sendActorTransaction);

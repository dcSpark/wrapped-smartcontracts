import {
  actorFactory,
  attachActor,
  decodePayload,
  getActorAddress,
  isActorDeployed,
} from "../services/actor.service";
import { provider, wallet } from "../services/blockchain.service";
import { getMainchainAddressFromSignature, verifySignature } from "../services/cardano.service";
import { z } from "zod";
import { COSEKey, COSESign1 } from "@emurgo/cardano-message-signing-nodejs";
import validationMiddleware from "./validationMiddleware";
import { JSONRPCErrorCode, JSONRPCErrorException } from "json-rpc-2.0";
import { ethers } from "ethers";
import { Address } from "@dcspark/cardano-multiplatform-lib-nodejs";
import { MINIMAL_GAS_LIMIT } from "../const";
import eth_getActorNonce from "./eth_getActorNonce";

const validateTransaction = async (
  coseSign1: COSESign1,
  coseKey: COSEKey
): Promise<{
  actorAddress: string;
  mainchainAddress: Address;
  gasLimit: ethers.BigNumberish;
  gasPrice: ethers.BigNumberish;
}> => {
  const mainchainAddress = getMainchainAddressFromSignature(coseSign1);

  if (!verifySignature(coseSign1, coseKey, mainchainAddress)) {
    throw new JSONRPCErrorException("Invalid signature", JSONRPCErrorCode.InvalidRequest);
  }

  const payload = coseSign1.payload();

  if (payload === undefined) {
    throw new JSONRPCErrorException("Invalid payload", JSONRPCErrorCode.InvalidRequest);
  }

  const { nonce, value, gasLimit, gasPrice } = decodePayload(payload);

  if ((gasLimit as ethers.BigNumber).lte(MINIMAL_GAS_LIMIT)) {
    throw new JSONRPCErrorException(
      `Gas limit too low, minimal limit ${MINIMAL_GAS_LIMIT}`,
      JSONRPCErrorCode.InvalidRequest
    );
  }

  const actorAddress = await getActorAddress(mainchainAddress.to_bech32());

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

  return { actorAddress, mainchainAddress, gasLimit, gasPrice };
};

const InputSchema = z.tuple([
  z.object({
    key: z.string().transform((key) => Buffer.from(key, "hex")),
    signature: z.string().transform((signature) => Buffer.from(signature, "hex")),
  }),
]);

const eth_sendActorTransaction = async ([{ signature, key }]: [
  { key: Buffer; signature: Buffer }
]) => {
  const coseSign1 = COSESign1.from_bytes(signature);
  const coseKey = COSEKey.from_bytes(key);

  const { actorAddress, mainchainAddress, gasLimit, gasPrice } = await validateTransaction(
    coseSign1,
    coseKey
  );

  if (await isActorDeployed(actorAddress)) {
    const actor = attachActor(actorAddress);

    const tx = await actor.connect(wallet).execute(signature, key, { gasLimit, gasPrice });

    return tx.hash;
  } else {
    const tx = await actorFactory
      .connect(wallet)
      .deployAndExecute(mainchainAddress.to_bech32(), ethers.constants.HashZero, signature, key, {
        gasLimit,
        gasPrice,
      });

    return tx.hash;
  }
};

export default validationMiddleware(InputSchema.parse, eth_sendActorTransaction);

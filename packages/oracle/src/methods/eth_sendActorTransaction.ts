import {
  actorFactory,
  attachActor,
  getActorAddress,
  isActorDeployed,
} from "../services/actor.service";
import { wallet } from "../services/blockchain.service";
import { getMainchainAddressFromSignature, verifySignature } from "../services/cardano.service";
import { z } from "zod";
import { COSEKey, COSESign1 } from "@emurgo/cardano-message-signing-nodejs";
import validationMiddleware from "./validationMiddleware";
import { JSONRPCErrorCode, JSONRPCErrorException } from "json-rpc-2.0";
import { ethers } from "ethers";

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

  const mainchainAddress = getMainchainAddressFromSignature(coseSign1);

  if (!verifySignature(coseSign1, coseKey, mainchainAddress)) {
    throw new JSONRPCErrorException("Invalid signature", JSONRPCErrorCode.InvalidRequest);
  }

  const actorAddress = await getActorAddress(mainchainAddress.to_bech32());

  if (await isActorDeployed(actorAddress)) {
    const actor = attachActor(actorAddress);

    const tx = await actor.connect(wallet).execute(signature, key);

    return tx.hash;
  } else {
    const tx = await actorFactory
      .connect(wallet)
      .deployAndExecute(mainchainAddress.to_bech32(), ethers.constants.HashZero, signature, key);

    return tx.hash;
  }
};

export default validationMiddleware(InputSchema.parse, eth_sendActorTransaction);

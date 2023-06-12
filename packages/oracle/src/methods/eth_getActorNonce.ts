import { ethers } from "ethers";
import { z } from "zod";
import { attachActor } from "../services/actor.service";
import { provider } from "../services/blockchain.service";
import validationMiddleware from "./validationMiddleware";

const InputSchema = z.tuple([
  z.string().refine((address) => ethers.utils.isAddress(address), { message: "Invalid address" }),
]);

const eth_getActorNonce = async ([actorAddress]: [string]) => {
  const actor = attachActor(actorAddress);

  const deployedBytecode = await provider.getCode(actorAddress);

  if (deployedBytecode === "0x") {
    return "0";
  } else {
    return (await actor.nonce()).toString();
  }
};

export default validationMiddleware(InputSchema.parse, eth_getActorNonce);

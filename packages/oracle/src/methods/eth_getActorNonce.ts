import { ethers } from "ethers";
import { z } from "zod";
import latestActorVersion from "../../actor-latest-version.json";
import { attachActor } from "../services/actor.service";
import { provider } from "../services/blockchain.service";
import validationMiddleware from "./validationMiddleware";

const actorAddressSchema = z
  .string()
  .refine((address) => ethers.utils.isAddress(address), { message: "Invalid address" });

const actorVersionSchema = z
  .number()
  .optional()
  .nullable()
  .refine(
    (actorVersion) =>
      actorVersion === undefined || actorVersion === null || actorVersion <= latestActorVersion,
    {
      message: "Invalid actor version",
    }
  );

const InputSchema = z.union([
  z.tuple([actorAddressSchema]),
  z.tuple([actorAddressSchema, actorVersionSchema]),
]);

const eth_getActorNonce = async ([actorAddress, actorVersion]: z.infer<typeof InputSchema>) => {
  const actor = attachActor(actorAddress, actorVersion ?? latestActorVersion);

  const deployedBytecode = await provider.getCode(actorAddress);

  if (deployedBytecode === "0x") {
    return "0";
  } else {
    return (await actor.nonce()).toString();
  }
};

export default validationMiddleware(InputSchema.parse, eth_getActorNonce);

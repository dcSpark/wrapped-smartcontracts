import { attachActor } from "../services/actor.service";
import { provider } from "../services/blockchain.service";

const eth_getActorNonce = async ([actorAddress]: [unknown]) => {
  if (typeof actorAddress !== "string") {
    throw new Error("Invalid actor address");
  }

  const actor = attachActor(actorAddress);

  const deployedBytecode = await provider.getCode(actorAddress);

  if (deployedBytecode === "0x") {
    return "0";
  } else {
    return (await actor.nonce()).toString();
  }
};

export default eth_getActorNonce;

import config from "../config";
import {
  actorFactory,
  attachActor,
  getActorAddress,
  isActorDeployed,
} from "../services/actor.service";
import { wallet } from "../services/blockchain.service";
import { getMainchainAddressFromSignature, verifySignature } from "../services/cardano.service";

interface SignedTransaction {
  key: string;
  signature: string;
}

const eth_sendActorTransaction = async ([signedTransaction]: [SignedTransaction]) => {
  const rawSignature = Buffer.from(signedTransaction.signature, "hex");
  const rawKey = Buffer.from(signedTransaction.key, "hex");

  const mainchainAddress = getMainchainAddressFromSignature(rawSignature);

  if (!verifySignature(rawSignature, rawKey, mainchainAddress)) {
    throw new Error("Invalid signature");
  }

  const actorAddress = getActorAddress(config.actorFactoryAddress, mainchainAddress.to_bech32());

  if (await isActorDeployed(actorAddress)) {
    const actor = attachActor(actorAddress);

    const tx = await actor.connect(wallet).execute(rawSignature, rawKey);

    return tx.hash;
  } else {
    const tx = await actorFactory
      .connect(wallet)
      .deployAndExecute(mainchainAddress.to_bech32(), `0x${"0".repeat(64)}`, rawSignature, rawKey);

    return tx.hash;
  }
};

export default eth_sendActorTransaction;

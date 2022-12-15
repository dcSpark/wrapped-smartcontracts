import config from "../config";
import { attachActor, getActorAddress } from "../services/actor.service";
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

  const actor = attachActor(actorAddress);

  const tx = await actor.connect(wallet).execute(rawSignature, rawKey);

  return tx.hash;
};

export default eth_sendActorTransaction;

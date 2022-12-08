import config from "../config";
import { attachActor, getActorAddress } from "../services/actor.service";
import { wallet } from "../services/blockchain.service";

interface SignedTransaction {
  key: string;
  signature: string;
}

const eth_sendActorTransaction = async ([mainchainAddress, signedTransaction]: [
  string,
  SignedTransaction
]) => {
  const actorAddress = getActorAddress(config.actorFactoryAddress, mainchainAddress);

  const actor = attachActor(actorAddress);

  const tx = await actor
    .connect(wallet)
    .execute(
      Buffer.from(signedTransaction.signature, "hex"),
      Buffer.from(signedTransaction.key, "hex")
    );

  return tx.hash;
};

export default eth_sendActorTransaction;

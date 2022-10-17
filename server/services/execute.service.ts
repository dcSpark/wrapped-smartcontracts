import { ethers, Transaction } from "ethers";
import { Actor } from "../../typechain-types";
import ActorArtifact from "../../artifacts/contracts/Actor.sol/Actor.json";
import { onConfirmation, wallet, webSocketProvider } from "./blockchain.service";

const attachActor = (actorAddress: string) => {
  return new ethers.Contract(actorAddress, ActorArtifact.abi, webSocketProvider) as Actor;
};

const postExecute = async (receipt: ethers.ContractReceipt) => {
  const responseEvent = receipt.events?.find(({ event }) => event === "ExecuteResponse");

  if (!responseEvent?.args) throw new Error("Unexpected error, no response event");

  const { response } = responseEvent.args;

  console.log(`Actor execution sucessful: ${response}`);
};

export const execute = async (actorAddress: string): Promise<Transaction> => {
  const actor = attachActor(actorAddress);

  if (!(await actor.canExecute())) throw new Error("Execute condition not met");

  const tx = await actor.connect(wallet).execute();

  onConfirmation(tx, postExecute);

  return tx;
};

export const canExecute = async (actorAddress: string): Promise<boolean> =>
  attachActor(actorAddress).canExecute();

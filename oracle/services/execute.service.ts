import { ethers, Transaction } from "ethers";
import { attachActor } from "./actor.service";
import { onConfirmation, wallet } from "./blockchain.service";

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

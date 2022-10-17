import { ethers, Transaction } from "ethers";
import { Actor } from "../../typechain-types";
import ActorArtifact from "../../artifacts/contracts/Actor.sol/Actor.json";
import { onConfirmation, wallet, webSocketProvider } from "./blockchain.service";

const attachActor = (actorAddress: string) => {
  return new ethers.Contract(actorAddress, ActorArtifact.abi, webSocketProvider) as Actor;
};

const postWithdraw = async (receipt: ethers.ContractReceipt) => {
  const responseEvent = receipt.events?.find(({ event }) => event === "WithdrawResponse");

  if (!responseEvent?.args) throw new Error("Unexpected error, no response event");

  const { response } = responseEvent.args;

  console.log(`Actor withdrawal sucessful: ${response}`);
};

export const withdraw = async (actorAddress: string): Promise<Transaction> => {
  const actor = attachActor(actorAddress);

  if (!(await actor.executed()) || !(await actor.canWithdraw()))
    throw new Error("Withdraw condition not met");

  const tx = await actor.connect(wallet).withdraw();

  onConfirmation(tx, postWithdraw);

  return tx;
};

export const emergencyWithdraw = async (actorAddress: string): Promise<Transaction> => {
  const actor = attachActor(actorAddress);

  if (!(await actor.executed()) || !(await actor.canEmergencyWithdraw()))
    throw new Error("Emergency withdraw condition not met");

  const tx = await actor.connect(wallet).emergencyWithdraw();

  onConfirmation(tx, postWithdraw);

  return tx;
};

export const canWithdraw = async (actorAddress: string): Promise<boolean> =>
  attachActor(actorAddress).canWithdraw();

export const canEmergencyWithdraw = async (actorAddress: string): Promise<boolean> =>
  attachActor(actorAddress).canEmergencyWithdraw();

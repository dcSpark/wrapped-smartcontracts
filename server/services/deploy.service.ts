import { ethers, Transaction } from "ethers";
import { actorFactory } from "./actor.service";
import { onConfirmation, wallet } from "./blockchain.service";

const getPostDeploy = (actorAddress: string) => async () =>
  console.log(`Actor deployed at: ${actorAddress}`);

export const deployActor = async (
  salt: string,
  initCode: string
): Promise<{ tx: Transaction; actorAddress: string }> => {
  const initCodeHash = ethers.utils.keccak256(initCode);

  const actorAddress = ethers.utils.getCreate2Address(actorFactory.address, salt, initCodeHash);

  const tx = await actorFactory.connect(wallet).deploy(salt, initCode);

  onConfirmation(tx, getPostDeploy(actorAddress));

  return { actorAddress, tx };
};

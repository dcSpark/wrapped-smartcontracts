import { ethers, Transaction } from "ethers";
import { abi as FactoryAbi } from "../../artifacts/contracts/ActorFactory.sol/ActorFactory.json";
import { ActorFactory } from "../../typechain-types";
import config from "../config";
import { onConfirmation, wallet, webSocketProvider } from "./blockchain.service";

export const actorFactory = new ethers.Contract(
  config.factoryAddress,
  FactoryAbi,
  webSocketProvider
) as ActorFactory;

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

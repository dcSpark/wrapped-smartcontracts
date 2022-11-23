import { ethers } from "hardhat";
import { BytesLike } from "ethers";
import { ActorFactory } from "../typechain-types";

let actorFactory: ActorFactory | undefined;

export const getActorFactory = async (): Promise<ActorFactory> => {
  if (actorFactory) {
    return actorFactory;
  }

  const contractFactory = await ethers.getContractFactory("ActorFactory");

  actorFactory = await contractFactory.deploy();

  await actorFactory.deployTransaction.wait();

  return actorFactory;
};

export const getActorAddress = async (
  factoryAddress: string,
  mainchainAddress: string,
  salt: BytesLike
): Promise<string> => {
  const actorArtifactFactory = await ethers.getContractFactory("Actor");
  const initCode = actorArtifactFactory.getDeployTransaction(mainchainAddress).data ?? [];
  const initCodeHash = ethers.utils.keccak256(initCode);

  return ethers.utils.getCreate2Address(factoryAddress, salt, initCodeHash);
};

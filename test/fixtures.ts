import { ethers } from "hardhat";
import { ActorFactory } from "../typechain-types";
import { BytesLike } from "@ethersproject/bytes";
import { ActorConstructorArgs } from "../types/Actor";

export const deployActorFactory = async () => {
  const factory = await ethers.getContractFactory("ActorFactory");
  return factory.deploy();
};

export const deployExampleContract = async () => {
  const factory = await ethers.getContractFactory("ExampleContract");
  return factory.deploy();
};

export const deployActor = async (
  actorFactory: ActorFactory,
  actorName: string,
  salt: BytesLike,
  constructorArgs: ActorConstructorArgs
) => {
  const initCode = await getActorInitCode(actorName, constructorArgs);
  const initCodeHash = ethers.utils.keccak256(initCode);

  const actorAddress = ethers.utils.getCreate2Address(actorFactory.address, salt, initCodeHash);

  await actorFactory.deploy(salt, initCode);

  return await ethers.getContractAt(actorName, actorAddress);
};

export const deployContracts = async () => {
  const actorFactory = await deployActorFactory();
  const exampleContract = await deployExampleContract();

  return { actorFactory, exampleContract };
};

export const getActorInitCode = async (
  actorName: string,
  { executeArgs, executeConditionArgs }: ActorConstructorArgs
) => {
  const factory = await ethers.getContractFactory(actorName);
  return factory.getDeployTransaction(executeArgs, executeConditionArgs).data ?? [];
};

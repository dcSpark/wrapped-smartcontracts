import { ethers } from "hardhat";
import { ActorFactory, ERC20 } from "../typechain-types";
import { BytesLike } from "@ethersproject/bytes";
import { BigNumberish } from "ethers";

export const deployActorFactory = async () => {
  const factory = await ethers.getContractFactory("ActorFactory");
  return factory.deploy();
};

export const deployExampleContract = async () => {
  const factory = await ethers.getContractFactory("ExampleContract");
  return factory.deploy();
};

export const deployTestToken = async (name: string, symbol: string) => {
  const factory = await ethers.getContractFactory("TestToken");
  return factory.deploy(name, symbol);
};

export const deploySwap = async () => {
  const factory = await ethers.getContractFactory("SimpleSwap");
  return factory.deploy();
};

export const deployBridge = async (tokens: ERC20[]) => {
  const factory = await ethers.getContractFactory("SidechainBridge");
  return factory.deploy(tokens.map(({ address }) => address));
};

export interface ActorConstructorArgs {
  payload: BytesLike;
  emergencyWithdrawalTimeout: BigNumberish;
}

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
  const testToken = await deployTestToken("Test Token", "TT");
  const swap = await deploySwap();
  const bridge = await deployBridge([testToken]);

  await testToken.mint(swap.address, ethers.utils.parseEther("1000000"));

  return { actorFactory, exampleContract, testToken, swap, bridge };
};

export const getActorInitCode = async (
  actorName: string,
  { payload, emergencyWithdrawalTimeout }: ActorConstructorArgs
) => {
  const factory = await ethers.getContractFactory(actorName);
  return factory.getDeployTransaction(payload, emergencyWithdrawalTimeout).data ?? [];
};

export const encodePayload = (types: string[], values: unknown[]) => {
  return ethers.utils.defaultAbiCoder.encode([`typle(${types.join(",")})`], [values]);
};

import { artifacts, ethers } from "hardhat";
import { ActorFactory, Actor__factory } from "../typechain-types";
import { BytesLike } from "@ethersproject/bytes";

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
  salt: BytesLike,
  ...actorParams: Parameters<Actor__factory["getDeployTransaction"]>
) => {
  const initCodeHash = ethers.utils.keccak256(await getActorInitCode(...actorParams));

  const actorAddress = ethers.utils.getCreate2Address(actorFactory.address, salt, initCodeHash);

  await actorFactory.deploy(salt, ...actorParams);

  return await ethers.getContractAt("Actor", actorAddress);
};

export const deployContracts = async () => {
  const actorFactory = await deployActorFactory();
  const exampleContract = await deployExampleContract();

  return { actorFactory, exampleContract };
};

export const getActorInitCode = async (
  ...constructorParameters: Parameters<Actor__factory["getDeployTransaction"]>
) => {
  const actorFactory = await ethers.getContractFactory("Actor");
  return actorFactory.getDeployTransaction(...constructorParameters).data ?? [];
};

export const encodeTransaction = async (
  contractName: string,
  functionName: string,
  parameters: unknown[]
) => {
  const artifact = await artifacts.readArtifactSync(contractName);
  const iface = new ethers.utils.Interface(artifact.abi);
  return iface.encodeFunctionData(functionName, parameters);
};

import { ethers } from "ethers";
import { abi as actorAbi } from "../artifacts/Actor.json";
import { abi as actorFactoryAbi } from "../artifacts/ActorFactory.json";
import type { Actor, ActorFactory } from "../typechain-types";
import { provider } from "./blockchain.service";
import actorArtifact from "../artifacts/Actor.json";
import config from "../config";

export const attachActor = (actorAddress: string) => {
  return new ethers.Contract(actorAddress, actorAbi, provider) as Actor;
};

export const actorFactory = new ethers.Contract(
  config.actorFactoryAddress,
  actorFactoryAbi,
  provider
) as ActorFactory;

export const isActorDeployed = async (actorAddress: string) => {
  const code = await provider.getCode(actorAddress);
  return code !== "0x";
};

export const getActorAddress = (
  factoryAddress: string,
  mainchainAddress: string,
  salt?: ethers.BytesLike
) => {
  const factory = ethers.ContractFactory.fromSolidity(actorArtifact);
  const initCode = factory.getDeployTransaction(mainchainAddress).data ?? [];
  const initCodeHash = ethers.utils.keccak256(initCode);

  return ethers.utils.getCreate2Address(
    factoryAddress,
    salt ? salt : `0x${"0".repeat(64)}`,
    initCodeHash
  );
};

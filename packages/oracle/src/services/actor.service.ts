import { ethers } from "ethers";
import { abi as actorAbi } from "../artifacts/Actor.json";
import { abi as actorFactoryAbi } from "../artifacts/ActorFactory.json";
import type { Actor, ActorFactory } from "../typechain-types";
import { provider } from "./blockchain.service";
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

export const getActorAddress = async (mainchainAddress: string, salt?: ethers.BytesLike) =>
  await actorFactory.getActorAddress(mainchainAddress, salt ?? ethers.constants.HashZero);

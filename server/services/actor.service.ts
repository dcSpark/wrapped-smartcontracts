import { ethers } from "ethers";
import { abi as FactoryAbi } from "../../artifacts/contracts/ActorFactory.sol/ActorFactory.json";
import { abi as ActorAbi } from "../../artifacts/contracts/Actor.sol/Actor.json";
import { ActorFactory, Actor } from "../../typechain-types";
import config from "../config";
import { jsonRpcProvider } from "./blockchain.service";

export const actorFactory = new ethers.Contract(
  config.factoryAddress,
  FactoryAbi,
  jsonRpcProvider
) as ActorFactory;

export const attachActor = (actorAddress: string) => {
  return new ethers.Contract(actorAddress, ActorAbi, jsonRpcProvider) as Actor;
};

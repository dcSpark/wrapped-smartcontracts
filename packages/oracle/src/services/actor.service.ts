import { ethers } from "ethers";
import { abi as actorAbi } from "../artifacts/Actor.json";
import type { Actor } from "../typechain-types";
import { provider } from "./blockchain.service";
import actorArtifact from "../artifacts/Actor.json";

export const attachActor = (actorAddress: string) => {
  return new ethers.Contract(actorAddress, actorAbi, provider) as Actor;
};

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

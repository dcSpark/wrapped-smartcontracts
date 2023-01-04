import actorArtifact from "./artifacts/Actor.json";
import { ethers } from "ethers";

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
    salt ? salt : ethers.constants.HashZero,
    initCodeHash
  );
};

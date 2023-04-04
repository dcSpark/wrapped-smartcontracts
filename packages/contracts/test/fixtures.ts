import type { BigNumberish, BytesLike } from "ethers";
import { ethers } from "hardhat";
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

export interface ActorTransaction {
  from: string;
  nonce: BigNumberish;
  to: string;
  value: BigNumberish;
  gasLimit: BigNumberish;
  gasPrice: BigNumberish;
  calldata: BytesLike;
}

export const encodePayload = ({
  from,
  nonce,
  to,
  value,
  gasLimit,
  gasPrice,
  calldata,
}: ActorTransaction): string => {
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "address", "uint256", "uint256", "uint256", "bytes"],
    [from, nonce, to, value, gasLimit, gasPrice, calldata]
  );
};

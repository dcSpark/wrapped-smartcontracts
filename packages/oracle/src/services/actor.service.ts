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

export interface ActorTransaction {
  nonce: ethers.BigNumberish;
  to: string;
  value: ethers.BigNumberish;
  gasLimit: ethers.BigNumberish;
  gasPrice: ethers.BigNumberish;
  calldata: ethers.BytesLike;
}

export const encodePayload = ({
  nonce,
  to,
  value,
  gasLimit,
  gasPrice,
  calldata,
}: ActorTransaction) => {
  return ethers.utils.defaultAbiCoder.encode(
    ["uint256", "address", "uint256", "uint256", "uint256", "bytes"],
    [nonce, to, value, gasLimit, gasPrice, calldata]
  );
};

export const decodePayload = (payload: ethers.BytesLike): ActorTransaction => {
  const [nonce, to, value, gasLimit, gasPrice, calldata] = ethers.utils.defaultAbiCoder.decode(
    ["uint256", "address", "uint256", "uint256", "uint256", "bytes"],
    payload
  );

  return {
    nonce,
    to,
    value,
    gasLimit,
    gasPrice,
    calldata,
  };
};

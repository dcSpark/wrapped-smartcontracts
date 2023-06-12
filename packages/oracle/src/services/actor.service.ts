import { ethers } from "ethers";
import { abi as actorAbi } from "../artifacts/Actor.json";
import { abi as actorFactoryAbi } from "../artifacts/ActorFactory.json";
import config from "../config";
import type { Actor, ActorFactory } from "../typechain-types";
import { provider } from "./blockchain.service";

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
  from: string;
  nonce: ethers.BigNumberish;
  to: string;
  value: ethers.BigNumberish;
  gasLimit: ethers.BigNumberish;
  gasPrice: ethers.BigNumberish;
  calldata: ethers.BytesLike;
}

export const encodePayload = ({
  from,
  nonce,
  to,
  value,
  gasLimit,
  gasPrice,
  calldata,
}: ActorTransaction) => {
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "address", "uint256", "uint256", "uint256", "bytes"],
    [from, nonce, to, value, gasLimit, gasPrice, calldata]
  );
};

export const decodePayload = (payload: ethers.BytesLike): ActorTransaction => {
  const [from, nonce, to, value, gasLimit, gasPrice, calldata] =
    ethers.utils.defaultAbiCoder.decode(
      ["address", "uint256", "address", "uint256", "uint256", "uint256", "bytes"],
      payload
    );

  return {
    from,
    nonce,
    to,
    value,
    gasLimit,
    gasPrice,
    calldata,
  };
};

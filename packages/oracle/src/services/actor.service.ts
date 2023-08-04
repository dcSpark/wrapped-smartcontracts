import { ethers } from "ethers";

import actorLatestVersion from "../../actor-latest-version.json";

import { abi as v1ActorAbi } from "../artifacts/v1/Actor.json";
import { abi as v1ActorFactoryAbi } from "../artifacts/v1/ActorFactory.json";

import { abi as v2ActorAbi } from "../artifacts/v2/Actor.json";
import { abi as v2ActorFactoryAbi } from "../artifacts/v2/ActorFactory.json";

import config from "../config";
import type { Actor, ActorFactory } from "../typechain-types";
import { provider } from "./blockchain.service";

const getActorAbi = (version: number) => {
  switch (version) {
    case 1:
      return v1ActorAbi;
    case 2:
      return v2ActorAbi;
    default:
      throw new Error(`Actor version ${version} is not supported`);
  }
};

export const getActorFactory = (version: number = actorLatestVersion) => {
  switch (version) {
    case 1:
      return new ethers.Contract(
        config.v1ActorFactoryAddress,
        v1ActorFactoryAbi,
        provider
      ) as ActorFactory;
    case 2:
      return new ethers.Contract(
        config.v2ActorFactoryAddress,
        v2ActorFactoryAbi,
        provider
      ) as ActorFactory;
    default:
      throw new Error(`ActorFactory version ${version} is not supported`);
  }
};

export const attachActor = (actorAddress: string, actorVersion: number = actorLatestVersion) =>
  new ethers.Contract(actorAddress, getActorAbi(actorVersion), provider) as Actor;

export const isActorDeployed = async (actorAddress: string) => {
  const code = await provider.getCode(actorAddress);
  return code !== "0x";
};

export const getActorAddress = async (
  mainchainAddress: string,
  salt?: ethers.BytesLike,
  actorVersion: number = actorLatestVersion
) =>
  await getActorFactory(actorVersion).getActorAddress(
    mainchainAddress,
    salt ?? ethers.constants.HashZero
  );

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

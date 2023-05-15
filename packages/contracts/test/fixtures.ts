import { PrivateKey } from "@dcspark/cardano-multiplatform-lib-nodejs";
import algosdk from "algosdk";
import type { BigNumberish, BytesLike } from "ethers";
import { ethers } from "hardhat";
import { ActorFactory } from "../typechain-types";
import cip8 from "../utils/cip8";

const SUPPORTED_L1_CHAINS = {
  CARDANO: "cardano",
  ALGORAND: "algorand",
} as const;

type SupportedL1Chain = typeof SUPPORTED_L1_CHAINS[keyof typeof SUPPORTED_L1_CHAINS];

let l1Chain: SupportedL1Chain;

if (Object.values(SUPPORTED_L1_CHAINS).some((chain) => chain === process.env.L1_CHAIN)) {
  l1Chain = process.env.L1_CHAIN as SupportedL1Chain;
} else {
  throw new Error(`L1_CHAIN must be one of ${Object.values(SUPPORTED_L1_CHAINS).join(", ")}`);
}

let actorFactory: ActorFactory | undefined;

export const getActorFactory = async (): Promise<ActorFactory> => {
  if (actorFactory) {
    return actorFactory;
  }

  const contractFactory = await ethers.getContractFactory("ActorFactory");

  const l1Type = l1Chain === SUPPORTED_L1_CHAINS.CARDANO ? 1 : 0;

  actorFactory = await contractFactory.deploy(l1Type);

  await actorFactory.deployTransaction.wait();

  return actorFactory;
};

export const getActorAddress = async (
  factoryAddress: string,
  mainchainAddress: string,
  salt: BytesLike
): Promise<string> => {
  const l1Type = l1Chain === SUPPORTED_L1_CHAINS.CARDANO ? 1 : 0;

  const actorArtifactFactory = await ethers.getContractFactory("Actor");
  const initCode = actorArtifactFactory.getDeployTransaction(mainchainAddress, l1Type).data ?? [];
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

export const l1Sign = (
  payload: Uint8Array,
  privateKey: Uint8Array,
  l1Address: string
): { signature: Uint8Array; key: Uint8Array } => {
  if (l1Chain === SUPPORTED_L1_CHAINS.CARDANO) {
    const { coseSign1, coseKey } = cip8.signCIP8(payload, privateKey, l1Address);

    return {
      signature: coseSign1.to_bytes(),
      key: coseKey.to_bytes(),
    };
  } else if (l1Chain === SUPPORTED_L1_CHAINS.ALGORAND) {
    const tx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: l1Address,
      to: l1Address,
      amount: 0,
      note: new Uint8Array(payload),
      suggestedParams: {
        fee: 0,
        flatFee: true,
        firstRound: 1,
        lastRound: 1,
        genesisID: "",
        genesisHash: "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8",
      },
    });

    const signedTx = algosdk.signTransaction(tx, privateKey);

    return {
      signature: signedTx.blob,
      key: tx.from.publicKey,
    };
  }

  throw new Error("unreachable");
};

export const getL1Credentials = (): {
  privateKey: Uint8Array;
  badPrivateKey: Uint8Array;
  mainchainAddress: string;
  badMainchainAddress: string;
} => {
  if (l1Chain === SUPPORTED_L1_CHAINS.CARDANO) {
    return {
      privateKey: PrivateKey.from_bech32(
        "ed25519e_sk1wzm7jmql8tnf3p4yx5seg389dhrg49z9j86a0hrwemehcx3he3dlvxcc663vxnl4anykugu9ttu94yfzuq5ulrxc6lckl647tm58jhqrr7at4"
      ).as_bytes(),
      badPrivateKey: PrivateKey.from_bech32(
        "ed25519e_sk1tzvc2amgpuz9ryhgg37gcmk0280mu02ktfkzcx7a28qc68phe3dnppwe830teqt2wk3nflwhlyneexkn37vnkqlfv9wzk4hz62e6fkcyk83hj"
      ).as_bytes(),
      mainchainAddress:
        "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn",
      badMainchainAddress:
        "addr_test1qpmh9svhrqxg7u6nqdxh44zlz0l2w22xc4zpwwfvj84cfwg2w3neh3dundxpwsr229yffepdec0z0yusftfn5teh6qwss2pt3j",
    };
  } else if (l1Chain === SUPPORTED_L1_CHAINS.ALGORAND) {
    const mnemonic =
      "need priority notice entry empower sail mask melt consider lamp pipe orange wrong gown inquiry enjoy try win assume crunch foot globe cargo absent habit";
    const badMnemonic =
      "near interest wait cool ensure dynamic vote cannon clog right rail zebra canoe bright yellow ordinary parade fade viable volcano hobby breeze trade absent black";

    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const badAccount = algosdk.mnemonicToSecretKey(badMnemonic);

    return {
      privateKey: account.sk,
      badPrivateKey: badAccount.sk,
      mainchainAddress: account.addr,
      badMainchainAddress: badAccount.addr,
    };
  }

  throw new Error("unreachable");
};

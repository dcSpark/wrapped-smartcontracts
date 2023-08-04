import dotenv from "dotenv";
import { ethers } from "ethers";

const loadStr = (name: string, defaultValue?: string): string => {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return value;
};

const loadNum = (name: string, defaultValue?: number): number =>
  +loadStr(name, defaultValue?.toString());

const loadBool = (name: string, defaultValue?: boolean): boolean =>
  loadStr(name, defaultValue?.toString()) === "true";

const loadConfig = () => {
  dotenv.config();

  return Object.freeze({
    env: loadStr("NODE_ENV", "development"),
    port: loadNum("PORT", 8080),
    jsonRpcProviderUrl: loadStr("JSON_RPC_PROVIDER_URL", "http://localhost:8545"),
    signerPrivateKey: loadStr(
      "SIGNER_PRIVATE_KEY",
      // private key corresponding to the funded account from testing genesis block
      "0x35f9400884bdd60fdd1a769ebf39fa1c5b148072e68a5b2c8bc9ac2227c192b2"
    ),
    actorDebugMode: loadBool("ACTOR_DEBUG_MODE", false),

    v1ActorFactoryAddress: loadStr("V1_ACTOR_FACTORY_ADDRESS", ethers.constants.AddressZero),
    v2ActorFactoryAddress: loadStr(
      "V2_ACTOR_FACTORY_ADDRESS",
      "0x0000000000000000000000000000000000111111"
    ),
  });
};

export default loadConfig();

import dotenv from "dotenv";

const loadStr = (name: string, defaultValue?: string): string => {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return value;
};

const loadNum = (name: string, defaultValue?: number): number =>
  +loadStr(name, defaultValue?.toString());

const loadConfig = () => {
  dotenv.config();

  return Object.freeze({
    port: loadNum("PORT", 3000),
    actorFactoryAddress: loadStr(
      "ACTOR_FACTORY_ADDRESS",
      "0x0000000000000000000000000000000000111111"
    ),
    jsonRpcProviderUrl: loadStr("JSON_RPC_PROVIDER_URL", "http://localhost:8545"),
    signerPrivateKey: loadStr(
      "SIGNER_PRIVATE_KEY",
      // private key corresponding to the funded account from testing genesis block
      "0x35f9400884bdd60fdd1a769ebf39fa1c5b148072e68a5b2c8bc9ac2227c192b2"
    ),
  });
};

export default loadConfig();

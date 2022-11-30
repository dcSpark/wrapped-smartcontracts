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
    jsonRpcProviderUrl: loadStr(
      "JSON_RPC_PROVIDER_URL",
      "https://rpc-devnet-cardano-evm.c1.milkomeda.com"
    ),
  });
};

export default loadConfig();

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
    port: loadNum("PORT", 8080),
    websocketProviderUrl: loadStr("WEBSOCKET_PROVIDER", "ws://localhost:8545"),
    factoryAddress: loadStr("FACTORY_ADDRESS"),
    privateKey: loadStr("PRIVATE_KEY"),
    transactionConfirmations: loadNum("TRANSACTION_CONFIRMATIONS", 1),
  });
};

export default loadConfig();

import { ethers } from "ethers";
import config from "../config";

export const webSocketProvider = new ethers.providers.JsonRpcProvider(config.websocketProviderUrl);

export const wallet = new ethers.Wallet(config.privateKey, webSocketProvider);

export const onConfirmation = (
  tx: ethers.ContractTransaction,
  callback: (receipt: ethers.ContractReceipt) => Promise<void>,
  confirmations: number = config.transactionConfirmations
) => {
  tx.wait(confirmations).then(callback).catch(console.error);
};

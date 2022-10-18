import { ethers } from "ethers";
import config from "../config";

export const jsonRpcProvider = new ethers.providers.JsonRpcProvider(config.providerUrl);

export const wallet = new ethers.Wallet(config.privateKey, jsonRpcProvider);

export const onConfirmation = (
  tx: ethers.ContractTransaction,
  callback: (receipt: ethers.ContractReceipt) => Promise<void>,
  confirmations: number = config.transactionConfirmations
) => {
  tx.wait(confirmations).then(callback).catch(console.error);
};

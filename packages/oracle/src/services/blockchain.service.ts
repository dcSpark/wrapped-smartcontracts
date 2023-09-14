import { ethers } from "ethers";
import config from "../config";

export const provider = new ethers.providers.StaticJsonRpcProvider(config.jsonRpcProviderUrl);

export const wallet = new ethers.Wallet(config.signerPrivateKey, provider);

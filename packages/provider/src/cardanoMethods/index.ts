import type { CustomMethod } from "../types";
import eth_accounts from "./eth_accounts";
import eth_requestAccounts from "./eth_requestAccounts";
import eth_sendTransaction from "./eth_sendTransaction";

const methods: { [key: string]: CustomMethod } = {
  eth_accounts,
  eth_requestAccounts,
  eth_sendTransaction,
};

export default methods;

import { CustomMethod } from "../types";
import eth_requestAccounts from "./eth_requestAccounts";
import eth_accounts from "./eth_accounts";

const methods: { [key: string]: CustomMethod } = {
  eth_requestAccounts,
  eth_accounts,
};

export default methods;

import { WSCLib } from "milkomeda-wsc";
import { StargateInfo } from "../components/ConnectWSC";
import invariant from "tiny-invariant";

export const getOriginTokens = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const originTokens = await provider.origin_getTokenBalances();
  return originTokens;
};

export const getTokenBalances = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const tokenBalances = await provider.getTokenBalances();
  return tokenBalances;
};

export const getDestinationBalance = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const destinationBalance = await provider.eth_getBalance();
  return destinationBalance;
};

export const getStargateInfo = async (provider?: WSCLib): Promise<StargateInfo> => {
  invariant(provider, "No wsc provider found");
  const stargate = await provider.stargateObject();
  return stargate;
};

export const getPendingTxs = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const pendingTxs = await provider.getPendingTransactions();
  return pendingTxs;
};

export const getOriginAddress = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const originAddress = await provider?.origin_getAddress();
  return originAddress;
};

export const getAddress = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const address = await provider.eth_getAccount();
  return address;
};

export const getOriginBalance = async (provider?: WSCLib) => {
  invariant(provider, "No wsc provider found");
  const originBalance = await provider.origin_getNativeBalance();
  return originBalance;
};

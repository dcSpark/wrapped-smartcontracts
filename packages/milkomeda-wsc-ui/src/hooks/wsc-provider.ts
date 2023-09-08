import { useQuery } from "wagmi";
import {
  getAddress,
  getDestinationBalance,
  getOriginAddress,
  getOriginBalance,
  getOriginTokens,
  getPendingTxs,
  getStargateInfo,
  getTokenBalances,
} from "../utils/wsc-provider";
import { useWSCProvider } from "./useWSCProvider";

export enum FunctionKeys {
  WSC_PROVIDER = "WSC_PROVIDER",
  ORIGIN_TOKENS = "ORIGIN_TOKENS",
  TOKENS = "TOKENS",
  DESTINATION_BALANCE = "DESTINATION_BALANCE",
  STARGATE_INFO = "STARGATE_INFO",
  PENDING_TXS = "PENDING_TXS",
  ORIGIN_ADDRESS = "ORIGIN_ADDRESS",
  ADDRESS = "ADDRESS",
  ORIGIN_BALANCE = "ORIGIN_BALANCE",
}

export const TOKENS_REFETCH_INTERVAL = 5000;

type Options = {
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchIntervalInBackground?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number;
  retryDelay?: (retryAttempt: number) => number;
  enabled?: boolean;
};

export const useGetOriginTokens = (options?: Options) => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery(
    [FunctionKeys.ORIGIN_TOKENS],
    () => getOriginTokens(wscProvider),
    options
  );
  return { ...response, originTokens: response.data ?? [] };
};

export const useGetWSCTokens = (options?: Options) => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery([FunctionKeys.TOKENS], () => getTokenBalances(wscProvider), options);
  return { ...response, tokens: response.data ?? [] };
};

export const useGetDestinationBalance = () => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery(
    [FunctionKeys.DESTINATION_BALANCE],
    () => getDestinationBalance(wscProvider),
    { refetchOnWindowFocus: true }
  );
  return { ...response, destinationBalance: response.data };
};
export const useGetStargateInfo = () => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery([FunctionKeys.STARGATE_INFO], () => getStargateInfo(wscProvider));
  return { ...response, stargateInfo: response.data };
};

export const useGetPendingTxs = () => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery([FunctionKeys.PENDING_TXS], () => getPendingTxs(wscProvider), {
    refetchInterval: TOKENS_REFETCH_INTERVAL,
  });
  return { pendingTxs: response.data ?? [], ...response };
};
export const useGetOriginAddress = () => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery<string | undefined, Error>([FunctionKeys.ORIGIN_ADDRESS], () =>
    getOriginAddress(wscProvider)
  );
  return {
    ...response,
    originAddress: response.data ?? "",
  };
};

export const useGetAddress = () => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery([FunctionKeys.ADDRESS], () => getAddress(wscProvider));
  return { ...response, address: response.data ?? "" };
};

export const useGetOriginBalance = () => {
  const { wscProvider } = useWSCProvider();
  const response = useQuery([FunctionKeys.ORIGIN_BALANCE], () => getOriginBalance(wscProvider), {
    refetchOnWindowFocus: true,
  });
  return { ...response, originBalance: response?.data ?? "" };
};

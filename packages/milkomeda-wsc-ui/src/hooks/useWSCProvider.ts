import { useContext, WSCContext } from "../components/ConnectWSC";

export const useWSCProvider = (): WSCContext => {
  const {
    wscProvider,
    originTokens,
    stargateInfo,
    tokens,
    destinationBalance,
    originBalance,
    pendingTxs,
    originAddress,
    address,
    isWSCConnected,
  } = useContext();

  return {
    wscProvider,
    originTokens,
    stargateInfo,
    tokens,
    destinationBalance,
    originBalance,
    pendingTxs,
    originAddress,
    address,
    isWSCConnected,
  };
};

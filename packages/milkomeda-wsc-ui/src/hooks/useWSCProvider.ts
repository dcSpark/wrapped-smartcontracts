import { useContext, WSCContext } from "../components/ConnectWSC";

export const useWSCProvider = (): WSCContext => {
  const { wscProvider, isWSCConnected } = useContext();

  return {
    wscProvider,
    isWSCConnected,
  };
};

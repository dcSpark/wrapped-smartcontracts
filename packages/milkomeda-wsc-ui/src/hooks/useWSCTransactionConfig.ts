import { useEffect } from "react";
import { DefaultCardanoAsset, useContext } from "../components/ConnectWSC";

export const useWSCTransactionConfig = ({
  defaultCardanoToken,
  contractAddress,
  wscActionCallback,
}: {
  defaultCardanoToken: DefaultCardanoAsset | null;
  contractAddress: string;
  wscActionCallback: () => Promise<void>;
}) => {
  const context = useContext();

  useEffect(() => {
    if (!defaultCardanoToken) return;
    if (!contractAddress) return;
    if (!wscActionCallback) return;
    context.setDefaultCardanoAsset(defaultCardanoToken);
    context.setContractAddress(contractAddress);
    context.setWscAction(wscActionCallback);
  }, []);
};

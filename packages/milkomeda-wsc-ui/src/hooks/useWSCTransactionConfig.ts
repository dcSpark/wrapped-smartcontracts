import { useEffect, useLayoutEffect } from "react";
import { DefaultCardanoAsset, StepTxDirection, useContext } from "../components/ConnectWSC";

export const useWSCTransactionConfig = ({
  defaultCardanoToken,
  evmTokenAddress,
  wscActionCallback,
  stepTxDirection,
  titleModal,
}: {
  defaultCardanoToken: DefaultCardanoAsset | null;
  evmTokenAddress: string;
  wscActionCallback: () => Promise<any>;
  stepTxDirection: StepTxDirection;
  titleModal?: string;
}) => {
  const context = useContext();

  useLayoutEffect(() => {
    context.wscActionRef.current = wscActionCallback;
  });

  useEffect(() => {
    if (!defaultCardanoToken) return;
    if (!evmTokenAddress) return;
    if (!stepTxDirection) return;

    context.setDefaultCardanoAsset(defaultCardanoToken);
    context.setEvmTokenAddress(evmTokenAddress);
    context.setStepTxDirection(stepTxDirection);
    if (titleModal) {
      context.setTitleModalTx(titleModal);
    }
  }, [defaultCardanoToken?.amount, defaultCardanoToken?.unit, evmTokenAddress, stepTxDirection]);
};

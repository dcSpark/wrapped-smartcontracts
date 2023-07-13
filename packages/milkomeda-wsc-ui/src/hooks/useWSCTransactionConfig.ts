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
    context.setDefaultCardanoAsset(defaultCardanoToken);
  }, [defaultCardanoToken?.amount, defaultCardanoToken?.unit]);

  useEffect(() => {
    context.setEvmTokenAddress(evmTokenAddress);
  }, [evmTokenAddress]);

  useEffect(() => {
    context.setStepTxDirection(stepTxDirection);
  }, [stepTxDirection]);

  useEffect(() => {
    if (!titleModal) return;
    context.setTitleModalTx(titleModal);
  }, [titleModal]);
};

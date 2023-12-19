import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import BigNumber from "bignumber.js";

export const useEstimateGas = () => {
  const [fee, setFee] = useState<BigNumber | undefined>(undefined);
  const provider = useProvider();

  useEffect(() => {
    provider.getGasPrice().then((gasPrice) => {
      const formattedGasPrice = new BigNumber(gasPrice.toString());
      setFee(formattedGasPrice.multipliedBy(1_000_000));
    });
  }, [provider]);

  return fee;
};

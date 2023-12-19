import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useProvider } from "wagmi";
import BigNumber from "bignumber.js";
import invariant from "tiny-invariant";

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

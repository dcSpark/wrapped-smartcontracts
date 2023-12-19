import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import BigNumber from "bignumber.js";
import { convertTokensToWei, convertWeiToTokens } from "../utils/convertWeiToTokens";

export const useEstimateGas = () => {
  const [fee, setFee] = useState<BigNumber | undefined>(undefined);
  const provider = useProvider();

  useEffect(() => {
    provider.getGasPrice().then((gasPrice) => {
      const formattedGasPrice = new BigNumber(gasPrice.toString());
      setFee(formattedGasPrice.multipliedBy(new BigNumber(1_000_000)));
    });
  }, [provider]);
  const baseFee = convertWeiToTokens({
    valueWei: fee?.toString(),
    token: { decimals: 18 },
  })
    .dp(2)
    .toString();

  return {
    fee,
    feeCardano: convertTokensToWei({
      value: baseFee?.toString(),
      token: { decimals: 6 },
    }).toString(),
  };
};

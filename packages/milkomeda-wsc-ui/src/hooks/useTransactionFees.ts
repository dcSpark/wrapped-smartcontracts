import { EVM_ESTIMATED_FEE, LOCK_ADA } from "../constants/transaction";
import { convertWeiToTokens } from "../utils/convertWeiToTokens";
import BigNumber from "bignumber.js";
import React from "react";
import { useGetStargateInfo } from "./wsc-provider";

export const useTransactionFees = () => {
  const { stargateInfo } = useGetStargateInfo();

  return React.useMemo(() => {
    const wrappingFee =
      stargateInfo &&
      convertWeiToTokens({
        valueWei: stargateInfo.fromNativeTokenInLoveLaceOrMicroAlgo,
        token: { decimals: 6 },
      });
    const unwrappingFee = stargateInfo && new BigNumber(stargateInfo.stargateNativeTokenFeeToL1);
    const bridgeFees = wrappingFee && unwrappingFee && wrappingFee.plus(unwrappingFee);
    const adaLocked = new BigNumber(LOCK_ADA);
    const evmEstimatedFee = new BigNumber(EVM_ESTIMATED_FEE);
    return {
      wrappingFee,
      unwrappingFee,
      bridgeFees,
      adaLocked,
      evmEstimatedFee,
    };
  }, [stargateInfo]);
};

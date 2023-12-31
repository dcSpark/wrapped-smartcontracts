import React from "react";

import BigNumber from "bignumber.js";
import { LabelWithBalance, useSelectedWrapToken } from "./WrapStep";
import { useTransactionFees } from "../../hooks/useTransactionFees";
import { convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { OverviewContent } from "../Common/Modal/styles";
import { BalancesWrapper, ErrorMessage } from "./styles";
import { LOVELACE_UNIT } from "../../constants/transaction";
import { OrDivider } from "../Common/Modal";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import { getDefaultTokenByChainId } from "../../utils/transactions";
import { useNetwork } from "wagmi";
import { useGetStargateInfo } from "../../hooks/wsc-provider";

const Overview = () => {
  const { stargateInfo } = useGetStargateInfo();
  const { chain } = useNetwork();
  const {
    options: { defaultWrapToken },
  } = useTransactionConfigWSC();
  const { selectedWrapToken } = useSelectedWrapToken();
  const { evmEstimatedFee, adaLocked, bridgeFees } = useTransactionFees();

  const amount =
    defaultWrapToken != null &&
    selectedWrapToken != null &&
    convertWeiToTokens({
      valueWei: defaultWrapToken.amount,
      token: {
        decimals: defaultWrapToken.unit === LOVELACE_UNIT ? 18 : selectedWrapToken?.decimals,
      },
    }).dp(2);

  const tranferTotalAmount =
    amount &&
    bridgeFees != null &&
    stargateInfo != null &&
    amount.plus(bridgeFees).plus(adaLocked).plus(evmEstimatedFee);

  const isAmountValid =
    tranferTotalAmount &&
    defaultWrapToken != null &&
    selectedWrapToken != null &&
    new BigNumber(tranferTotalAmount).lte(selectedWrapToken.quantity);

  const isAboveMinAmount =
    stargateInfo != null &&
    selectedWrapToken != null &&
    defaultWrapToken != null &&
    new BigNumber(defaultWrapToken.amount).gte(stargateInfo?.stargateMinNativeTokenFromL1);

  const defaultSymbol = getDefaultTokenByChainId(chain?.id);

  return (
    <OverviewContent>
      <BalancesWrapper>
        <LabelWithBalance
          label="You're moving:"
          amount={defaultWrapToken != null && amount && amount.toFixed()}
          assetName={
            defaultWrapToken?.unit === LOVELACE_UNIT ? defaultSymbol : selectedWrapToken?.assetName
          }
        />
        <LabelWithBalance
          label="Bridge fees:"
          amount={bridgeFees?.toFixed()}
          assetName={defaultSymbol}
          tooltipMessage={`This fee is paid to the bridge for wrapping (0.1 ${defaultSymbol}) and unwrapping (1 ${defaultSymbol}) your tokens.`}
        />
        <LabelWithBalance
          label="Bridge Lock-up:"
          amount={adaLocked?.toFixed()}
          assetName={defaultSymbol}
          tooltipMessage={`This deposit is a temporary lock of 3 ADA in the bridge. Upon unwrapping, you will receive back the 3 ${defaultSymbol} from the deposit.`}
        />
        <LabelWithBalance
          label="Estimated EVM fees"
          amount={`~${evmEstimatedFee?.toFixed()}`}
          assetName={defaultSymbol}
        />
        <OrDivider />
        {defaultWrapToken?.unit === LOVELACE_UNIT ? (
          <LabelWithBalance
            label="You'll transfer:"
            amount={tranferTotalAmount && tranferTotalAmount?.toFixed()}
            assetName={defaultSymbol}
          />
        ) : (
          <>
            <LabelWithBalance
              label="You'll transfer:"
              amount={tranferTotalAmount && amount?.toFixed()}
              assetName={selectedWrapToken?.assetName}
            />
            <LabelWithBalance
              label=""
              amount={tranferTotalAmount && tranferTotalAmount.minus(amount)?.toFixed()}
              assetName={defaultSymbol}
            />
          </>
        )}
      </BalancesWrapper>
      {selectedWrapToken != null && !selectedWrapToken.bridgeAllowed && (
        <ErrorMessage role="alert">Error: Bridge doesn't allow this token</ErrorMessage>
      )}
      {selectedWrapToken != null && !isAmountValid && (
        <ErrorMessage role="alert">Error: Amount exceeds your current balance</ErrorMessage>
      )}
      {selectedWrapToken != null &&
        selectedWrapToken.unit === LOVELACE_UNIT &&
        !isAboveMinAmount && (
          <ErrorMessage role="alert">
            Error: Minimum amount to wrap is {stargateInfo?.stargateMinNativeTokenFromL1}{" "}
            {defaultSymbol}
          </ErrorMessage>
        )}
    </OverviewContent>
  );
};

export default Overview;

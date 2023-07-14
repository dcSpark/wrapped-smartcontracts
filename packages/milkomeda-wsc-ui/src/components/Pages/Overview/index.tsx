import React from "react";
import { useContext } from "../../ConnectWSC";

import { OverviewContent } from "../../Common/Modal/styles";

import BigNumber from "bignumber.js";
import { BalancesWrapper } from "../../TransactionStepper/styles";
import { LabelWithBalance, WrapToken } from "../../TransactionStepper/WrapStep";
import { convertWeiToTokens } from "../../../utils/convertWeiToTokens";
import { OrDivider } from "../../Common/Modal";
import { useTransactionFees } from "../../../hooks/useTransactionFees";
import { DEFAULT_SYMBOL } from "../../../constants/transaction";

const Overview: React.FC<{ selectedWrapToken: WrapToken | null }> = ({ selectedWrapToken }) => {
  const { defaultCardanoAsset, stargateInfo } = useContext();
  const { evmEstimatedFee, adaLocked, bridgeFees } = useTransactionFees();

  if (defaultCardanoAsset == null) {
    throw new Error("set your defaultCardanoAsset");
  }
  const amount =
    defaultCardanoAsset.unit === "lovelace"
      ? convertWeiToTokens({
          valueWei: defaultCardanoAsset.amount,
          token: { decimals: 18 },
        }).dp(2, BigNumber.ROUND_UP)
      : new BigNumber(+defaultCardanoAsset.amount).dp(4, BigNumber.ROUND_UP);

  const tranferTotalAmount =
    amount &&
    bridgeFees != null &&
    stargateInfo != null &&
    amount.plus(bridgeFees).plus(adaLocked).plus(evmEstimatedFee);

  return (
    <OverviewContent>
      <BalancesWrapper>
        <LabelWithBalance
          label="You're moving:"
          amount={amount?.toFixed()}
          assetName={
            defaultCardanoAsset.unit === "lovelace" ? DEFAULT_SYMBOL : selectedWrapToken?.assetName
          }
        />
        <LabelWithBalance
          label="Bridge fees:"
          amount={bridgeFees?.toFixed()}
          assetName={DEFAULT_SYMBOL}
          tooltipMessage="This fee is paid to the bridge for wrapping (0.1 TADA) and unwrapping (1 TADA) your tokens."
        />
        <LabelWithBalance
          label="Bridge Lock-up:"
          amount={adaLocked?.toFixed()}
          assetName={DEFAULT_SYMBOL}
          tooltipMessage="This deposit is a temporary lock of 3 ADA in the bridge. Upon unwrapping, you will receive back the 3 ADA from the deposit."
        />
        <LabelWithBalance
          label="Estimated EVM fees"
          amount={`~${evmEstimatedFee?.toFixed()}`}
          assetName={DEFAULT_SYMBOL}
        />
        <OrDivider />
        {defaultCardanoAsset?.unit === "lovelace" ? (
          <LabelWithBalance
            label="You'll transfer:"
            amount={tranferTotalAmount && tranferTotalAmount?.toFixed()}
            assetName={DEFAULT_SYMBOL}
          />
        ) : (
          <>
            <LabelWithBalance
              label="You'll transfer:"
              amount={tranferTotalAmount && amount?.toFixed()}
              assetName={selectedWrapToken?.assetName}
              tooltipMessage={`Please keep in mind that number of decimals calculation for the token is different, eg: ${amount?.toFixed()} tReserveCoin is equivalent to ${amount?.dividedBy(
                10 ** (selectedWrapToken?.decimals ?? 0)
              )} RC `}
            />
            <LabelWithBalance
              label=""
              amount={tranferTotalAmount && tranferTotalAmount.minus(amount)?.toFixed()}
              assetName={DEFAULT_SYMBOL}
            />
          </>
        )}
      </BalancesWrapper>
    </OverviewContent>
  );
};

export default Overview;

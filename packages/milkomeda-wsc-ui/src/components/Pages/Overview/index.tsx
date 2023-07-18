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
import { useTransactionConfigWSC } from "../../TransactionConfigWSC";

const Overview: React.FC<{ selectedWrapToken: WrapToken | null }> = ({ selectedWrapToken }) => {
  const { stargateInfo } = useContext();
  const { evmEstimatedFee, adaLocked, bridgeFees } = useTransactionFees();
  const {
    options: { defaultWrapToken },
  } = useTransactionConfigWSC();

  const amount = React.useMemo(() => {
    if (!defaultWrapToken) return;
    return defaultWrapToken.unit === "lovelace"
      ? convertWeiToTokens({
          valueWei: defaultWrapToken.amount,
          token: { decimals: 18 },
        }).dp(2, BigNumber.ROUND_UP)
      : new BigNumber(+defaultWrapToken.amount).dp(4, BigNumber.ROUND_UP);
  }, [defaultWrapToken]);

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
            bridgeFees
              ? defaultWrapToken?.unit === "lovelace"
                ? DEFAULT_SYMBOL
                : selectedWrapToken?.assetName
              : null
          }
          {...(defaultWrapToken?.unit !== "lovelace" && {
            tooltipMessage: `Please keep in mind that number of decimals calculation for the token is different, eg: ${amount?.toFixed()} tReserveCoin is equivalent to ${amount?.dividedBy(
              10 ** (selectedWrapToken?.decimals ?? 0)
            )} RC `,
          })}
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
        {defaultWrapToken?.unit === "lovelace" ? (
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

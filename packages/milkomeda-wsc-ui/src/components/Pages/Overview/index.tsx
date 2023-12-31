import React from "react";

import { OverviewContent } from "../../Common/Modal/styles";

import BigNumber from "bignumber.js";
import { BalancesWrapper } from "../../TransactionStepper/styles";
import { LabelWithBalance, WrapToken } from "../../TransactionStepper/WrapStep";
import { convertWeiToTokens } from "../../../utils/convertWeiToTokens";
import { OrDivider } from "../../Common/Modal";
import { useTransactionFees } from "../../../hooks/useTransactionFees";
import { useTransactionConfigWSC } from "../../TransactionConfigWSC";
import { getDefaultTokenByChainId } from "../../../utils/transactions";
import { useNetwork } from "wagmi";
import { LOVELACE_UNIT } from "../../../constants/transaction";
import { useGetStargateInfo } from "../../../hooks/wsc-provider";

const Overview: React.FC<{ selectedWrapToken: WrapToken | null }> = ({ selectedWrapToken }) => {
  const { stargateInfo } = useGetStargateInfo();
  const { chain } = useNetwork();
  const { evmEstimatedFee, adaLocked, bridgeFees } = useTransactionFees();
  const {
    options: { defaultWrapToken },
  } = useTransactionConfigWSC();

  const amount = React.useMemo(() => {
    if (!defaultWrapToken || !selectedWrapToken) return;
    return defaultWrapToken.unit === LOVELACE_UNIT
      ? convertWeiToTokens({
          valueWei: defaultWrapToken.amount,
          token: { decimals: 18 },
        }).dp(2, BigNumber.ROUND_UP)
      : convertWeiToTokens({
          valueWei: defaultWrapToken.amount,
          token: selectedWrapToken,
        });
  }, [defaultWrapToken, selectedWrapToken]);

  const tranferTotalAmount =
    amount &&
    bridgeFees != null &&
    stargateInfo != null &&
    amount.plus(bridgeFees).plus(adaLocked).plus(evmEstimatedFee);

  const defaultSymbol = getDefaultTokenByChainId(chain?.id);

  return (
    <OverviewContent>
      <BalancesWrapper>
        <LabelWithBalance
          label="You're moving:"
          amount={amount?.toFixed()}
          assetName={
            bridgeFees
              ? defaultWrapToken?.unit === LOVELACE_UNIT
                ? defaultSymbol
                : selectedWrapToken?.assetName
              : null
          }
          {...(selectedWrapToken?.decimals === 0 && {
            warningMessage: `The token hasn't defined if this amount includes decimals places e.g., 100 could be a 100 USD or 1.00 USD`,
          })}
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
          tooltipMessage="This deposit is a temporary lock of 3 ADA in the bridge. Upon unwrapping, you will receive back the 3 ADA from the deposit."
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
    </OverviewContent>
  );
};

export default Overview;

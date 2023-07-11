import React from "react";
import { routes, useContext } from "../../ConnectWSC";

import { OverviewContent } from "../../Common/Modal/styles";

import BigNumber from "bignumber.js";
import { BalancesWrapper, ErrorMessage } from "../../TransactionStepper/styles";
import { LabelWithBalance, WrapToken } from "../../TransactionStepper/WrapStep";
import { convertWeiToTokens } from "../../../utils/convertWeiToTokens";
import { OrDivider } from "../../Common/Modal";
import { useTransactionFees } from "../../../hooks/useTransactionFees";
import { DEFAULT_SYMBOL } from "../../../constants/transactionFees";

const Overview: React.FC<{ selectedWrapToken: WrapToken | null }> = ({ selectedWrapToken }) => {
  const { defaultCardanoAsset, stargateInfo, setRoute, setAcceptedWSC } = useContext();
  const { evmEstimatedFee, adaLocked, bridgeFees } = useTransactionFees();

  const amount =
    defaultCardanoAsset != null &&
    selectedWrapToken != null &&
    convertWeiToTokens({
      valueWei: defaultCardanoAsset.amount,
      token: {
        decimals: defaultCardanoAsset.unit === "lovelace" ? 18 : selectedWrapToken?.decimals,
      },
    }).dp(2);

  const tranferTotalAmount =
    amount &&
    bridgeFees != null &&
    stargateInfo != null &&
    amount.plus(bridgeFees).plus(adaLocked).plus(evmEstimatedFee);

  const isAmountValid =
    tranferTotalAmount &&
    defaultCardanoAsset != null &&
    selectedWrapToken != null &&
    new BigNumber(tranferTotalAmount).lte(selectedWrapToken.quantity);

  const isAboveMinAmount =
    stargateInfo != null &&
    selectedWrapToken != null &&
    defaultCardanoAsset != null &&
    new BigNumber(defaultCardanoAsset.amount).gte(stargateInfo?.stargateMinNativeTokenFromL1);

  return (
    <OverviewContent>
      <BalancesWrapper>
        <LabelWithBalance
          label="You're moving:"
          amount={defaultCardanoAsset != null && amount && amount.toFixed()}
          assetName={
            defaultCardanoAsset?.unit === "lovelace"
              ? DEFAULT_SYMBOL
              : selectedWrapToken?.assetName
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
            />
            <LabelWithBalance
              label=""
              amount={tranferTotalAmount && tranferTotalAmount.minus(amount)?.toFixed()}
              assetName={DEFAULT_SYMBOL}
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
      {selectedWrapToken != null && selectedWrapToken.unit === "lovelace" && !isAboveMinAmount && (
        <ErrorMessage role="alert">
          Error: Minimum amount to wrap is {stargateInfo?.stargateMinNativeTokenFromL1}{" "}
          {DEFAULT_SYMBOL}
        </ErrorMessage>
      )}
    </OverviewContent>
  );
};

export default Overview;
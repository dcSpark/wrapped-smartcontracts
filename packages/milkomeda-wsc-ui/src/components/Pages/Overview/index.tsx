import React, { useEffect, useState } from "react";
import { routes, useContext } from "../../ConnectWSC";

import { useConnect, useDisconnect, useAccount, useNetwork } from "wagmi";

import { ModalBody, ModalContent, OverviewContent } from "../../Common/Modal/styles";

export const BRIDGE_FEE = 1.1;
export const LOCK_ADA = 3;
export const EVM_ESTIMATED_FEE = 0.01;

import BigNumber from "bignumber.js";
import {
  BalancesWrapper,
  ErrorMessage,
  OverviewDescription,
} from "../../TransactionStepper/styles";
import {
  defaultSymbol,
  LabelWithBalance,
  useSelectedWrapToken,
} from "../../TransactionStepper/WrapStep";
import { convertWeiToTokens } from "../../../utils/convertWeiToTokens";
import Button from "../../Common/Button";
import { OrDivider } from "../../Common/Modal";

const Overview: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const { defaultCardanoAsset, stargateInfo, setRoute, setAcceptedWSC } = useContext();
  const { selectedWrapToken } = useSelectedWrapToken();

  const amount = defaultCardanoAsset && new BigNumber(defaultCardanoAsset.amount);
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
  const tranferTotalAmount =
    amount != null &&
    bridgeFees != null &&
    stargateInfo != null &&
    amount.plus(bridgeFees).plus(adaLocked).plus(evmEstimatedFee);

  const isAmountValid =
    tranferTotalAmount &&
    defaultCardanoAsset != null &&
    selectedWrapToken != null &&
    new BigNumber(tranferTotalAmount).lte(selectedWrapToken?.quantity);

  const isAboveMinAmount =
    stargateInfo != null &&
    selectedWrapToken != null &&
    defaultCardanoAsset != null &&
    new BigNumber(defaultCardanoAsset.amount).gte(stargateInfo?.stargateMinNativeTokenFromL1);

  return (
    <OverviewContent>
      <ModalContent
        style={{ paddingBottom: 22, gap: 6, marginBottom: 40, justifyContent: "space-between" }}
      >
        <ModalBody>
          <OverviewDescription>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </OverviewDescription>

          <BalancesWrapper>
            <LabelWithBalance
              label="You're moving:"
              amount={
                defaultCardanoAsset != null && new BigNumber(defaultCardanoAsset.amount).toFixed()
              }
              assetName={
                defaultCardanoAsset?.unit === "lovelace" ? "TADA" : selectedWrapToken?.assetName
              }
            />
            <LabelWithBalance
              label="Bridge fees:"
              amount={bridgeFees?.toFixed()}
              assetName={"TADA"}
              tooltipMessage="This fee is paid to the bridge for wrapping (0.1 TADA) and unwrapping (1 TADA) your tokens."
            />
            <LabelWithBalance
              label="Bridge Lock-up:"
              amount={adaLocked?.toFixed()}
              assetName={"TADA"}
              tooltipMessage="This deposit is a temporary lock of 3 ADA in the bridge. Upon unwrapping, you will receive back the 3 ADA from the deposit."
            />
            <LabelWithBalance
              label="Estimated EVM fees"
              amount={`~${evmEstimatedFee?.toFixed()}`}
              assetName={"mTADA"}
            />
            <OrDivider />
            {defaultCardanoAsset?.unit === "lovelace" ? (
              <LabelWithBalance
                label="You'll transfer:"
                amount={tranferTotalAmount && tranferTotalAmount?.toFixed()}
                assetName={"TADA"}
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
                  assetName={"TADA"}
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
          {selectedWrapToken != null && !isAboveMinAmount && (
            <ErrorMessage role="alert">
              Error: Minimum amount to wrap is {stargateInfo?.stargateMinNativeTokenFromL1}{" "}
              {defaultSymbol}
            </ErrorMessage>
          )}
        </ModalBody>
        <Button
          variant="primary"
          disabled={!stargateInfo}
          style={{ marginTop: 20 }}
          onClick={() => {
            setRoute(routes.STEPPER);
            setAcceptedWSC(true);
          }}
        >
          Continue
        </Button>
      </ModalContent>
    </OverviewContent>
  );
};

export default Overview;

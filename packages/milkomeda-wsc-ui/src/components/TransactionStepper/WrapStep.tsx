import { useContext } from "../ConnectWSC";
import React from "react";
import { convertWeiToTokens } from "../../utils/convertWeiToTokens";
import { AnimatePresence } from "framer-motion";
import { Balance, BalanceContainer, LoadingBalance } from "../Pages/Profile/styles";
import BigNumber from "bignumber.js";
import {
  BalancesWrapper,
  ErrorMessage,
  LabelText,
  LabelWithBalanceContainer,
  StepDescription,
  StepTitle,
} from "./styles";

const balance = true;

type WrapToken = {
  assetName: string;
  bridgeAllowed: boolean;
  decimals: number;
  fingerprint: string;
  has_nft_onchain_metadata: boolean;
  quantity: BigNumber;
  unit: string;
};
const WrapStep = ({ defaultAmountEth = "30", defaultTokenUnit = "lovelace" }) => {
  const [selectedWrapToken, setSelectedWrapToken] = React.useState<WrapToken | null>(null);
  const { wscProvider, originTokens, stargateInfo } = useContext();
  const [formattedOriginTokens, setFormattedOriginTokens] = React.useState([]);

  const [txHash, setTxHash] = React.useState(null);

  const [txStatus, setTxStatus] = React.useState("idle");

  // useInterval(
  //   async () => {
  //     if (!wscProvider || txHash == null) return;
  //     const response = await wscProvider.getTxStatus(txHash);
  //     setTxStatus(response);
  //     if (response === TxPendingStatus.Confirmed) {
  //       setTxHash(null);
  //       setTimeout(() => {
  //         goNextStep();
  //       }, 2000);
  //     }
  //   },
  //   txHash != null ? 4000 : null
  // );

  const wrapToken = async () => {
    setTxStatus("init");
    try {
      // const txHash = await wscProvider?.wrap(
      //   undefined,
      //   selectedToken.unit,
      //   new BigNumber(amount ?? "0")
      // );
      // setTxHash(txHash);
      setTxStatus("pending");
    } catch (err) {
      console.error(err);
      setTxStatus("error");
    }
  };

  // const handleTokenChange = (tokenUnit) => {
  //   const token = formattedOriginTokens.find((t) => t.unit === tokenUnit);
  //   setSelectedToken(token);
  // };
  // const onMaxToken = () => {
  //   setAmount(selectedToken.quantity?.toFixed());
  // };

  React.useEffect(() => {
    const loadOriginTokens = async () => {
      const token = originTokens.find((t) => t.unit === defaultTokenUnit);
      if (!token) return;
      const defaultToken = {
        ...token,
        quantity: convertWeiToTokens({ valueWei: token.quantity, token }),
      };
      setSelectedWrapToken(defaultToken);
    };
    loadOriginTokens();
  }, [defaultAmountEth, defaultTokenUnit, originTokens, setSelectedWrapToken]);

  const fee =
    stargateInfo != null ? new BigNumber(stargateInfo?.stargateMinNativeTokenFromL1) : null;

  const isAmountValid =
    selectedWrapToken != null && fee != null
      ? new BigNumber(defaultAmountEth).plus(fee).lte(selectedWrapToken?.quantity)
      : false;

  return (
    <div>
      <StepTitle>Wrap Tokens: Connecting Cardano and Ethereum</StepTitle>
      <StepDescription>
        Explore the power of wrap tokens as they seamlessly connect Cardano and Ethereum, enabling
        users to leverage the benefits of both blockchain ecosystems. With wrap tokens, Cardano
        tokens can be wrapped and utilized on the Ethereum network, expanding access to
        decentralized applications and fostering interoperability between these two prominent
        blockchain platforms.
      </StepDescription>
      <BalancesWrapper>
        <LabelWithBalance
          label="Amount to wrap:"
          amount={new BigNumber(defaultAmountEth).toFixed()}
          assetName={selectedWrapToken?.assetName}
        />
        <LabelWithBalance
          label="Estimated fee:"
          amount={fee?.toFixed()}
          assetName={selectedWrapToken?.assetName}
        />
        <LabelWithBalance
          label="Total:"
          amount={fee && new BigNumber(defaultAmountEth).plus(fee).toFixed()}
          assetName={selectedWrapToken?.assetName}
        />
      </BalancesWrapper>

      {selectedWrapToken != null && !selectedWrapToken.bridgeAllowed && (
        <ErrorMessage role="alert">Error: Bridge doesn't allow this token</ErrorMessage>
      )}
      {selectedWrapToken != null && !isAmountValid && (
        <ErrorMessage role="alert">Error: Amount exceeds your current balance</ErrorMessage>
      )}

      {/*<div>*/}
      {/*  {txStatus !== TxPendingStatus.Confirmed && txStatus !== "idle" && txStatus !== "error" && (*/}
      {/*    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />*/}
      {/*  )}*/}
      {/*  {txStatus !== "idle" && <p>{statusWrapFirstMessages[txStatus]}</p>}*/}
      {/*</div>*/}
    </div>
  );
};

export default WrapStep;

const LabelWithBalance = ({ label, amount, assetName }) => {
  return (
    <LabelWithBalanceContainer>
      <LabelText>{label} </LabelText>
      <BalanceContainer>
        <AnimatePresence exitBeforeEnter initial={false}>
          {amount && assetName ? (
            <Balance
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>
                {amount}
                {` `}
              </span>
              {assetName}
            </Balance>
          ) : (
            <LoadingBalance
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              &nbsp;
            </LoadingBalance>
          )}
        </AnimatePresence>
      </BalanceContainer>
    </LabelWithBalanceContainer>
  );
};

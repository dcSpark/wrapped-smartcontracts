import React, { useState } from "react";
import { CheckCircle2, LucideInfo, XCircle } from "lucide-react";
import { Stepper, StepperStep } from "../Common/Stepper";
import { ResetContainer } from "../../styles";
import {
  AmountInputContainer,
  Container,
  InputContainer,
  Label,
  List,
  ListItem,
  PendingItem,
  Row,
  Skeleton,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
  Title,
  Value,
} from "./styles";
import { useWSCProvider } from "../../hooks/useWSCProvider";
import CopyToClipboard from "../Common/CopyToClipboard";
import { convertTokensToWei, convertWeiToTokens } from "../../utils/convertWeiToTokens";
import Tooltip from "../Common/Tooltip";
import Button from "../Common/Button";
import BigNumber from "bignumber.js";
import { OriginAmount } from "milkomeda-wsc/build/CardanoPendingManger";
import { TX_STATUS_CHECK_INTERVAL, TxStatus } from "../../constants/transaction";
import { useTransactionStatus } from "../../hooks/useTransactionStatus";
import useInterval from "../../hooks/useInterval";
import { ErrorMessage, TransactionExternalLink } from "../TransactionStepper/styles";
import { TxPendingStatus } from "milkomeda-wsc";
import { statusWrapMessages, SuccessMessage } from "../TransactionStepper/WrapStep";
import { truncateCardanoAddress, truncateEthAddress } from "../../utils";
import { statusUnwrapMessages } from "../TransactionStepper/UnwrapStep";
import { MilkomedaLink } from "../Common/Modal/styles";
import { MilkomedaIcon } from "../Common/Modal";
import { useContext } from "../ConnectWSC";
import { useNetwork } from "wagmi";
import { getBridgeExplorerUrl } from "../../utils/transactions";
import {
  TOKENS_REFETCH_INTERVAL,
  useGetAddress,
  useGetDestinationBalance,
  useGetOriginAddress,
  useGetOriginBalance,
  useGetOriginTokens,
  useGetPendingTxs,
  useGetWSCTokens,
} from "../../hooks/wsc-provider";

export const WSCInterface = () => {
  const context = useContext();
  const { isWSCConnected } = useWSCProvider();
  const { destinationBalance } = useGetDestinationBalance();
  const { originBalance } = useGetOriginBalance();

  const isOriginBalanceNotZero = originBalance != null && +originBalance !== 0;
  const isDestinationBalanceNotZero = destinationBalance != null && +destinationBalance !== 0;
  const steps = [
    {
      label: "Cardano",
      isCompletedStep: isOriginBalanceNotZero,
    },
    {
      label: "WSC",
      isCompletedStep: isDestinationBalanceNotZero,
    },
    {
      label: "Dapp",
      description: "(Ready to Go)",
      isCompletedStep: isOriginBalanceNotZero && isDestinationBalanceNotZero,
    },
  ];

  return (
    <ResetContainer $customTheme={context.customTheme}>
      <Container style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 23,
            left: 20,
            width: 32,
            height: 32,
          }}
        >
          <MilkomedaLink
            key="infoButton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.1,
              delay: 0,
            }}
            href="https://milkomeda.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MilkomedaIcon />
          </MilkomedaLink>
        </div>
        <div style={{ padding: "30px 0 0" }}>
          <Stepper
            activeStep={!isDestinationBalanceNotZero ? 1 : !isOriginBalanceNotZero ? 0 : 2}
            successIcon={<CheckCircle2 />}
            errorIcon={<XCircle />}
            labelOrientation="vertical"
          >
            {steps.map((step, index) => (
              <StepperStep index={index} key={index} {...step} />
            ))}
          </Stepper>
        </div>

        {(!isWSCConnected || !originBalance || !destinationBalance) && (
          <div style={{ marginTop: 30 }}>
            <List style={{ flexDirection: "row", marginBottom: 20 }}>
              <Skeleton style={{ width: "100%", height: 40 }} />
              <Skeleton style={{ width: "100%", height: 40 }} />
              <Skeleton style={{ width: "100%", height: 40 }} />
              <Skeleton style={{ width: "100%", height: 40 }} />
            </List>
            <Skeleton style={{ width: "60%", margin: "auto", height: 24, marginBottom: 20 }} />
            <List>
              <Skeleton style={{ width: "100%", height: 80 }} />
              <Skeleton style={{ width: "100%", height: 80 }} />
            </List>
          </div>
        )}

        {isWSCConnected && originBalance && destinationBalance && (
          <TabsRoot defaultValue="about" orientation="vertical">
            <TabsList aria-label="WSC Wallet Content">
              <TabsTrigger value="about">
                <span>About</span>
              </TabsTrigger>
              <TabsTrigger value="cardano">
                <span>Cardano</span>
              </TabsTrigger>
              <TabsTrigger value="pending">
                <span>Pending</span>
              </TabsTrigger>
              <TabsTrigger value="wsc-wallet">
                <span>WSC Wallet</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="about">
              <About />
            </TabsContent>
            <TabsContent value="cardano">
              <Cardano />
            </TabsContent>
            <TabsContent value="pending">
              <Pending />
            </TabsContent>
            <TabsContent value="wsc-wallet">
              <WSCWallet />
            </TabsContent>
          </TabsRoot>
        )}
      </Container>
    </ResetContainer>
  );
};

function About() {
  return (
    <div className="about-content">
      <Title>What are Wrapped Smart Contracts?</Title>
      <Text>
        Wrapped Smart Contracts are a new concept aimed at facilitating interaction with smart
        contracts on sidechains or Layer 2 (L2) solutions without the need for users to directly
        migrate to these new ecosystems.
        <br />
        <br /> The Layer 1 (L1) blockchain acts as a robust coordination layer, allowing users to
        execute smart contracts on sidechains or L2 while remaining on the L1 blockchain. This
        provides a user-friendly experience, as users can interact with various systems without
        changing wallets or needing a deep understanding of the underlying processes.
      </Text>
      <a
        className="about-link"
        href="https://docs.milkomeda.com/cardano/wrapped-smart-contracts"
        target="_blank"
      >
        Read more
      </a>

      <Title>How it works</Title>
      <Text className="about-description">
        Every single step requires user interaction in the form of a transaction.
      </Text>
      <List className="about-items">
        {[
          {
            subtitle: "User Action:",
            description:
              "The user initiates an action on a dApp while on the main blockchain. This request is translated into specific parameters for a proxy smart contract.",
          },
          {
            subtitle: "Proxy Deployment and Execution:",
            description:
              "A proxy smart contract, reflecting the user's intent, is deployed on the sidechain. The proxy contract then interacts with the appropriate smart contract on the sidechain to execute the desired action.",
          },
          {
            subtitle: "Result Processing:",
            description:
              "The outcome from the sidechain smart contract execution is relayed back to the user on the main blockchain. The user's state is updated, and they see the results of their action on the dApp, all while staying on the main blockchain.",
          },
        ].map(({ subtitle, description }) => (
          <li key={subtitle}>
            <span style={{ fontWeight: 500 }}>{subtitle}</span> {description}
          </li>
        ))}
      </List>
      <a
        className="about-link"
        href="https://docs.milkomeda.com/cardano/wrapped-smart-contracts"
        target="_blank"
      >
        Read more
      </a>
    </div>
  );
}

function Cardano() {
  const { isLoading, isSuccess, originAddress } = useGetOriginAddress();
  const { originTokens } = useGetOriginTokens({ refetchInterval: TOKENS_REFETCH_INTERVAL });
  const [tokenAmounts, setTokenAmounts] = useState<Map<string, string>>(new Map());

  const updateTokenAmount = (tokenUnit: string, amount: string) => {
    const newTokenAmounts = new Map(tokenAmounts);
    newTokenAmounts.set(tokenUnit, amount);
    setTokenAmounts(newTokenAmounts);
  };

  const setMaxAmount = (token: OriginAmount) => {
    if (!token) return;
    const adjustedAmount = convertWeiToTokens({
      valueWei: token.quantity,
      token: token,
    });

    updateTokenAmount(token.unit, adjustedAmount.toString());
  };

  return (
    <div>
      <Title>Assets in Your Cardano Wallet</Title>
      <div style={{ maxWidth: "80%", margin: "auto", marginBottom: 20, fontSize: "0.875rem" }}>
        <CopyToClipboard string={originAddress}>
          <span style={{ wordBreak: "break-all" }}>{truncateCardanoAddress(originAddress)}</span>
        </CopyToClipboard>
      </div>
      {isLoading && (
        <List style={{ flexDirection: "column", marginBottom: 20 }}>
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
        </List>
      )}
      {isSuccess && originTokens.length === 0 && (
        <Text style={{ textAlign: "center" }}>No tokens found.</Text>
      )}
      <List>
        {isSuccess &&
          originTokens.map((token, index) => (
            <CardanoAssetItem
              key={index}
              token={token}
              updateTokenAmount={updateTokenAmount}
              tokenAmounts={tokenAmounts}
              setMaxAmount={setMaxAmount}
            />
          ))}
      </List>
    </div>
  );
}

const CardanoAssetItem = ({ token, tokenAmounts, updateTokenAmount, setMaxAmount }) => {
  const { wscProvider } = useWSCProvider();
  const { txStatus, txStatusError, setTxStatusError, setTxStatus, isLoading, isError, isSuccess } =
    useTransactionStatus();
  const { chain } = useNetwork();
  const [txHash, setTxHash] = React.useState<string | undefined>();

  const moveToken = async (token) => {
    setTxStatus(TxStatus.Init);

    try {
      const wrapAmount = convertTokensToWei({
        value: tokenAmounts.get(token.unit) || "0",
        token: token,
      });

      const txHash = await wscProvider?.wrap(undefined, token.unit, wrapAmount.toNumber());
      setTxHash(txHash);
      setTxStatus(TxStatus.Pending);

      updateTokenAmount(token.unit, "");
    } catch (err) {
      setTxStatus(TxStatus.Error);
      console.error(err);
      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };
  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
    },
    txHash != null && txStatus !== TxStatus.Confirmed ? TX_STATUS_CHECK_INTERVAL : null
  );

  return (
    <ListItem>
      <Row>
        <Label style={{ paddingLeft: "16px" }}>Balance: </Label>
        <Value>
          {convertWeiToTokens({
            valueWei: token.quantity,
            token: token,
          }).toFixed()}{" "}
          {token.assetName}
        </Value>
        {!token.bridgeAllowed && (
          <Tooltip message="Token is not supported by the bridge" xOffset={-6}>
            <LucideInfo />
          </Tooltip>
        )}
      </Row>
      {token.bridgeAllowed && (
        <>
          <AmountInput
            label="Enter amount to wrap"
            value={tokenAmounts.get(token.unit) || ""}
            id="wrap-amount"
            onChange={(e) => updateTokenAmount(token.unit, e.target.value)}
            onMax={() => setMaxAmount(token)}
          />
          {isError && (
            <ErrorMessage style={{ marginBottom: 10 }} role="alert">
              Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
            </ErrorMessage>
          )}
          {isSuccess && (
            <SuccessMessage
              disableGutters
              message={statusWrapMessages[TxPendingStatus.Confirmed]}
              href={`${getBridgeExplorerUrl(chain?.id)}/wrap/${txHash}`}
              viewLabel="Milkomeda Bridge Explorer"
            />
          )}
          <Button
            waiting={isLoading}
            variant="primary"
            style={{ marginTop: 0 }}
            disabled={isLoading || !tokenAmounts.get(token.unit)}
            onClick={() => moveToken(token)}
          >
            {isLoading ? statusWrapMessages[txStatus] : "Move to L2"}
          </Button>
        </>
      )}
    </ListItem>
  );
};

function Pending() {
  const { isLoading, isSuccess, pendingTxs } = useGetPendingTxs();

  return (
    <div>
      <Title>List of pending transactions between Cardano and Milkomeda</Title>
      {isSuccess && pendingTxs?.length === 0 && (
        <Text style={{ textAlign: "center" }}>No pending transaction found.</Text>
      )}
      {isLoading && (
        <List style={{ flexDirection: "column", marginBottom: 20 }}>
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
        </List>
      )}
      <List>
        {isSuccess &&
          pendingTxs?.length > 0 &&
          pendingTxs.map((tx, index) => {
            const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;
            return (
              <PendingItem
                key={index}
                style={{
                  padding: "14px 10px",
                  borderRadius: "4px",
                  border: "1px solid var(--wsc-body-color-muted)",
                }}
              >
                <Row>
                  <Label>Hash:</Label>
                  <TransactionExternalLink
                    href={tx.explorer ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortHash}
                  </TransactionExternalLink>
                </Row>
                <Row>
                  <Label>Timestamp:</Label>
                  <Value>{new Date(tx.timestamp * 1000).toLocaleString()}</Value>
                </Row>
                <Row>
                  <Label>Type:</Label>
                  <Value>{tx.type === "Wrap" ? "Moving to Milkomeda" : "Moving to L1"}</Value>
                </Row>
              </PendingItem>
            );
          })}
      </List>
    </div>
  );
}

const mADATokenAddress = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";
function WSCWallet() {
  const { wscProvider } = useWSCProvider();
  const { address } = useGetAddress();
  const { destinationBalance } = useGetDestinationBalance();
  const { isLoading, isSuccess, tokens } = useGetWSCTokens({
    refetchInterval: TOKENS_REFETCH_INTERVAL,
  });
  const [allowedTokensMap, setAllowedTokensMap] = React.useState({});

  React.useEffect(() => {
    if (!tokens) return;
    const assetIds = tokens.map((token) => token.contractAddress);
    wscProvider?.areTokensAllowed(assetIds).then(setAllowedTokensMap);
  }, [tokens]);

  return (
    <div>
      <Title>Assets in Your Wrapped Smart Contract Wallet</Title>
      <div style={{ maxWidth: "80%", margin: "auto", marginBottom: 20, fontSize: "0.875rem" }}>
        <CopyToClipboard string={address}>{address}</CopyToClipboard>
      </div>
      {isLoading && (
        <List style={{ flexDirection: "column", marginBottom: 20 }}>
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
          <Skeleton style={{ width: "100%", height: 40 }} />
        </List>
      )}
      <List>
        {isSuccess &&
          destinationBalance &&
          [
            {
              decimals: 6, // already scaled
              name: "ADA",
              symbol: "",
              contractAddress: mADATokenAddress,
              balance: convertTokensToWei({
                value: new BigNumber(destinationBalance).dp(6),
                token: { decimals: 6 },
              }).toFixed(),
            },
            ...tokens,
          ]?.map((token, index) => (
            <WSCAssetItem key={index} token={token} allowedTokensMap={allowedTokensMap} />
          ))}
      </List>
    </div>
  );
}

function AmountInput({ label, onMax, value, onChange, id }) {
  return (
    <AmountInputContainer>
      <label htmlFor={id}>{label}</label>
      <InputContainer>
        <input type="text" value={value} onChange={onChange} id={id} placeholder="Enter amount" />
        <button onClick={onMax}>MAX</button>
      </InputContainer>
    </AmountInputContainer>
  );
}

function WSCAssetItem({ token, allowedTokensMap }) {
  const { wscProvider } = useWSCProvider();
  const { chain } = useNetwork();
  const [txHash, setTxHash] = React.useState<string | undefined>();

  const { txStatus, txStatusError, setTxStatusError, setTxStatus, isLoading, isError, isSuccess } =
    useTransactionStatus();

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
    },
    txHash != null && txStatus !== TxStatus.Confirmed ? TX_STATUS_CHECK_INTERVAL : null
  );

  const unwrapToken = async (token) => {
    if (!token || !wscProvider) return;
    setTxStatus(TxStatus.Init);
    const isNativeToken = token.contractAddress === mADATokenAddress;

    const unwrapOptions = {
      destination: undefined,
      assetId: isNativeToken ? undefined : token.contractAddress,
      amount: new BigNumber(token.balance),
    };

    try {
      const txHash = await wscProvider.unwrap(
        unwrapOptions.destination,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        unwrapOptions.assetId!,
        unwrapOptions.amount
      );
      setTxHash(txHash);
      setTxStatus(TxStatus.Pending);
    } catch (err) {
      console.error(err);
      setTxStatus(TxStatus.Error);
      if (err instanceof Error) {
        setTxStatusError(err.message);
      }
    }
  };

  return (
    <ListItem>
      <Row>
        <Label>Token</Label>
        <Value>
          {token.name} {token.symbol && `(${token.symbol?.toUpperCase()})`}
        </Value>
        {token.contractAddress !== mADATokenAddress &&
          !allowedTokensMap?.[token.contractAddress] && (
            <Tooltip message="Token is not supported by the bridge" xOffset={-6}>
              <LucideInfo />
            </Tooltip>
          )}
      </Row>
      <Row>
        <Label>Balance</Label>
        <Value>
          {convertWeiToTokens({
            valueWei: token.balance,
            token: token,
          }).toFixed()}{" "}
        </Value>
        {token.contractAddress !== mADATokenAddress &&
          !allowedTokensMap?.[token.contractAddress] && (
            <Tooltip message="Token is not supported by the bridge" xOffset={-6}>
              <LucideInfo />
            </Tooltip>
          )}
      </Row>

      <Row>
        <Label>Contract Address</Label>
        <TransactionExternalLink
          href={`https://explorer-devnet-cardano-evm.c1.milkomeda.com/address/${token.contractAddress}`}
          target="_blank"
          rel="noreferrer"
        >
          {truncateEthAddress(token.contractAddress)}
        </TransactionExternalLink>
      </Row>
      {isError && (
        <ErrorMessage style={{ marginBottom: 10 }} role="alert">
          Ups, something went wrong. {txStatusError ? `Error: ${txStatusError}` : ""}{" "}
        </ErrorMessage>
      )}
      {isSuccess && (
        <SuccessMessage
          disableGutters
          message={statusUnwrapMessages[TxPendingStatus.Confirmed]}
          href={`${getBridgeExplorerUrl[chain?.id ?? 200101]}/search/tx?query=${txHash}`}
          viewLabel="Milkomeda Bridge Explorer"
        />
      )}
      {(token.contractAddress === mADATokenAddress ||
        allowedTokensMap?.[token.contractAddress]) && (
        <Button
          variant="primary"
          onClick={() => unwrapToken(token)}
          waiting={isLoading}
          style={{ marginTop: 0 }}
          disabled={isLoading}
        >
          {isLoading ? statusUnwrapMessages[txStatus] : "Move all to L1"}
        </Button>
      )}
    </ListItem>
  );
}

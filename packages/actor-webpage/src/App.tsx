import { WSCLib } from "milkomeda-wsc";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WrappedSmartContractWalletAssets from "./components/WSCWalletAssets";
import Summary from "./components/Summary";
import Header from "./components/Header";
import { Activity } from "../../milkomeda-wsc/src/Activity";
import BigNumber from "bignumber.js";
import {
  EVMTokenBalance,
  MilkomedaNetworkName,
  PendingTx,
  TxPendingStatus,
} from "milkomeda-wsc/build/WSCLibTypes";
import { OriginAmount } from "milkomeda-wsc/build/CardanoPendingManger";
import "./App.css";

let wscLib2: InstanceType<typeof WSCLib>;

const App: React.FC = () => {
  const [originAddress, setOriginAddress] = useState<string | null>(null);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [destinationBalance, setDestinationBalance] = useState<string | null>(null);
  const [originBalance, setOriginBalance] = useState<string | null>(null);
  const [originTokens, setOriginTokens] = useState<OriginAmount[]>([]);
  const [tokens, setTokens] = useState<EVMTokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Activity[]>([]);
  const [algorandConnected, setAlgorandConnected] = useState<boolean>(false);
  const [cardanoConnected, setCardanoConnected] = useState<boolean>(false);
  const [network, setNetwork] = useState<string | null>(null);

  const wrapWrapper = async (
    destination: string | undefined,
    assetId: string,
    amount: BigNumber,
    additionalFee?: number,
  ) => {
    // TODO: check that amount.toNumber() is correct
    return wscLib2.wrap(destination, assetId, amount.toNumber(), additionalFee);
  };

  const unwrapWrapper = async (
    destination: string | undefined,
    assetId: string,
    amount: BigNumber,
  ) => {
    return wscLib2.unwrap(destination, assetId, amount);
  };

  const useInterval = (callback: () => void, delay: number | null) => {
    const savedCallback = useRef<() => void | undefined>(undefined);

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      if (delay !== null) {
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

  const updateWalletData = useCallback(async () => {
    const destinationBalance = await wscLib2.eth_getBalance();
    setDestinationBalance(destinationBalance);

    const originBalance = await wscLib2.origin_getNativeBalance();
    setOriginBalance(originBalance);

    const pendingTxs = await wscLib2.getPendingTransactions();
    setPendingTxs(pendingTxs);

    const originTokens = await wscLib2.origin_getTokenBalances();
    setOriginTokens(originTokens);
  }, []);

  useInterval(() => {
    if ((cardanoConnected || algorandConnected) && window.ethereum !== undefined) {
      updateWalletData();
    }
  }, 5000);

  const handleConnectWalletAlgorand = async () => {
    if (!algorandConnected) {
      const network = MilkomedaNetworkName.A1Devnet;
      const wscLib = new WSCLib(network, "PeraWallet");
      wscLib2 = await wscLib.inject();
      if (window.ethereum !== undefined) {
        setAlgorandConnected(true);
        await handleConnectWallet(network);
      } else {
        window.ethereum = undefined;
        setAlgorandConnected(false);
      }
    }
  };

  const handleConnectWalletCardano = async (option: string) => {
    if (!cardanoConnected) {
      const network = MilkomedaNetworkName.C1Devnet;
      const wscLib = new WSCLib(MilkomedaNetworkName.C1Devnet, option, {
        oracleUrl: process.env.WSC_ORACLE,
        blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
        jsonRpcProviderUrl: undefined,
      });
      wscLib2 = await wscLib.inject();
      if (window.ethereum !== undefined) {
        setCardanoConnected(true);
        await handleConnectWallet(network);
      } else {
        window.ethereum = undefined;
        setCardanoConnected(false);
      }
    }
  };

  const handleConnectWallet = async (network: MilkomedaNetworkName) => {
    setNetwork(network);
    const address = await wscLib2.eth_getAccount();
    setAddress(address);
    const originAddress = await wscLib2.origin_getAddress();
    setOriginAddress(originAddress);
    updateWalletData();
  };

  const moveAssetsToL1 = async (tokenId: string, tokenName: string, amount: BigNumber) => {
    await wscLib2.unwrap(undefined, tokenId, amount);
  };

  const getTxStatus = async (hash: string): Promise<TxPendingStatus> => {
    return await wscLib2.getTxStatus(hash);
  };

  const areTokensAllowed = async (assetIds: string[]) => {
    return await wscLib2.areTokensAllowed(assetIds);
  };

  useEffect(() => {
    // TODO: figure out how to enable them later on
    // handleConnectWalletAlgorand();
    // handleConnectWalletCardano();
  }, []);

  useEffect(() => {
    const getTokens = async () => {
      if (algorandConnected || cardanoConnected) {
        const tokenBalances = await wscLib2.getTokenBalances();
        setTokens(tokenBalances);
      }
    };

    getTokens();
  }, [address]);

  // Get transactions
  useEffect(() => {
    const getTransactions = async () => {
      if (algorandConnected || cardanoConnected) {
        const latestActivity = await wscLib2.latestActivity();
        setTransactions(latestActivity);
      }
    };

    getTransactions();
  }, [address]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Header
        algorandConnected={algorandConnected}
        cardanoConnected={cardanoConnected}
        handleConnectWalletCardano={handleConnectWalletCardano}
        handleConnectWalletAlgorand={handleConnectWalletAlgorand}
      />
      {(algorandConnected || cardanoConnected) && (
        <div>
          <Summary
            originAddress={originAddress}
            originBalance={originBalance}
            isCardano={cardanoConnected}
          />
          <WrappedSmartContractWalletAssets
            connected={algorandConnected || cardanoConnected}
            address={address}
            destinationBalance={destinationBalance}
            pendingTxs={pendingTxs}
            network={network}
            tokens={tokens}
            originTokens={originTokens}
            moveAssetsToL1={moveAssetsToL1}
            wrap={wrapWrapper}
            unwrap={unwrapWrapper}
            transactions={transactions}
            getTxStatus={getTxStatus}
            areTokensAllowed={areTokensAllowed}
            isCardano={cardanoConnected}
          />
        </div>
      )}
    </div>
  );
};

export default App;

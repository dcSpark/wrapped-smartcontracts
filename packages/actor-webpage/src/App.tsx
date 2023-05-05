import WSCLib, {
  MilkomedaNetworkName,
  PendingTx,
  TransactionResponse,
  UserWallet,
} from "./WSCLib";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WrappedSmartContractWalletAssets from "./components/WSCWalletAssets";
import Summary from "./components/Summary";
import Header from "./components/Header";
import { Activity } from "./Activity";

let wscLib2: any;

const App: React.FC = () => {
  const [originAddress, setOriginAddress] = useState<string | null>(null);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [destinationBalance, setDestinationBalance] = useState<string | null>(null);
  const [originBalance, setOriginBalance] = useState<string | null>(null);
  const [originTokens, setOriginTokens] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Activity[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [network, setNetwork] = useState<string | null>(null);

  // TODO: Move oracleUrl and ethUrl to .env?
  const oracleUrl = "http://localhost:8080";
  const ethUrl = "https://rpc-devnet-cardano-evm.c1.milkomeda.com";

  const wscLib = new WSCLib(MilkomedaNetworkName.C1Devnet, oracleUrl, ethUrl, UserWallet.Flint);

  const wrapWrapper = async (destination: string | undefined, assetId: string, amount: number) => {
    return wscLib2.wrap(destination, assetId, amount);
  };

  const unwrapWrapper = async (destination: string | undefined, assetId: string, amount: number) => {
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
    const destinationBalance = await wscLib.eth_getBalance();
    setDestinationBalance(destinationBalance);

    const originBalance = await wscLib.origin_getADABalance();
    setOriginBalance(originBalance);

    const pendingTxs = await wscLib.getPendingTransactions();
    setPendingTxs(pendingTxs);

    const originTokens = await wscLib.origin_getTokenBalances();
    setOriginTokens(originTokens);
  }, []);

  useInterval(() => {
    if (connected && window.ethereum !== undefined) {
      updateWalletData();
    }
  }, 5000);

  // TODO: we should allow to connect Cardano or Algorand wallets
  const handleConnectWallet = async () => {
    if (!connected) {
      wscLib2 = await wscLib.inject();
      if (window.ethereum !== undefined) {
        setConnected(true);
        // this should be automatically detected from provider
        setNetwork(MilkomedaNetworkName.C1Devnet);

        const address = await wscLib.eth_getAccount();
        setAddress(address);

        const originAddress = await wscLib.origin_getAddress();
        setOriginAddress(originAddress);

        updateWalletData();
      }
    } else {
      // Handle disconnect logic here
      window.ethereum = undefined;
      setConnected(false);
    }
  };

  const moveAssetsToL1 = async (tokenId: string, tokenName: string) => {
    console.log(`Moving ${tokenName} to L1...`);
  };

  useEffect(() => {
    handleConnectWallet();
  }, []);

  useEffect(() => {
    const getTokens = async () => {
      if (connected) {
        const tokenBalances = await wscLib.getTokenBalances();
        setTokens(tokenBalances);
      }
    };

    getTokens();
  }, [address]);

  // Get transactions
  useEffect(() => {
    const getTransactions = async () => {
      if (connected) {
        const latestActivity = await wscLib.latestActivity();
        setTransactions(latestActivity);
      }
    };

    getTransactions();
  }, [address]);

  return (
    <div>
    <Header connected={connected} handleConnectWallet={handleConnectWallet} />
    <br />
    {connected && (
      <div>
        <Summary originAddress={originAddress} originBalance={originBalance} />
        <WrappedSmartContractWalletAssets
          connected={connected}
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
        />
      </div>
    )}
  </div>
  );
};

export default App;

import WSCLib, {
  MilkomedaNetwork,
  PendingTx,
  TransactionResponse,
  UserWallet,
} from "./WSCLib";
import React, { useEffect, useState } from "react";
import WrappedSmartContractWalletAssets from "./components/WSCWalletAssets";
import Summary from "./components/Summary";
import Header from "./components/Header";

let wscLib2: any;

const App: React.FC = () => {
  const [originAddress, setOriginAddress] = useState<string | null>(null);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [destinationBalance, setDestinationBalance] = useState<string | null>(null);
  const [originBalance, setOriginBalance] = useState<string | null>(null);
  const [originTokens, setOriginTokens] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [network, setNetwork] = useState<string | null>(null);

  // TODO: Move oracleUrl and ethUrl to .env?
  const oracleUrl = "http://localhost:8080";
  const ethUrl = "https://rpc-devnet-cardano-evm.c1.milkomeda.com";

  const wscLib = new WSCLib(MilkomedaNetwork.C1Devnet, oracleUrl, ethUrl, UserWallet.Flint);

  const wrapWrapper = async (destination: string | undefined, assetId: string, amount: number) => {
    console.log("Lucid: ", wscLib.lucid);
    return wscLib.wrap(destination, assetId, amount);
  };

  // TODO: we should allow to connect Cardano or Algorand wallets
  const handleConnectWallet = async () => {
    if (!connected) {
      await wscLib.inject();
      if (window.ethereum !== undefined) {
        setConnected(true);

        // this should be automatically detected from provider
        setNetwork(MilkomedaNetwork.C1Devnet);

        const address = await wscLib.eth_getAccount();
        setAddress(address);

        const destinationBalance = await wscLib.eth_getBalance();
        setDestinationBalance(destinationBalance);

        const originBalance = await wscLib.origin_getADABalance();
        setOriginBalance(originBalance);

        const originAddress = await wscLib.origin_getAddress();
        setOriginAddress(originAddress);

        const pendingTxs = await wscLib.getPendingTransactions();
        setPendingTxs(pendingTxs);

        const originTokens = await wscLib.origin_getTokenBalances();
        setOriginTokens(originTokens);
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
        const transactionHistory = await wscLib.getTransactionList();
        setTransactions(transactionHistory);
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
          // wrap={(destination: string | undefined, assetId: string, amount: number) => {
          //   return wscLib.wrap(destination, assetId, amount);
          // }}
          transactions={transactions}
        />
      </div>
    )}
  </div>
  );
};

export default App;

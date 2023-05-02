import BigNumber from "bignumber.js";
import WSCLib, { MilkomedaNetwork, TokenBalance, TransactionResponse, UserWallet } from "./WSCLib";
import React, { useEffect, useState } from "react";
import { Wallet } from "ethers";
// import { format } from 'date-fns';

const App: React.FC = () => {
  const [originAddress, setOriginAddress] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  // TODO: Move oracleUrl and ethUrl to .env?
  const oracleUrl = "http://localhost:8080";
  const ethUrl = "https://rpc-devnet-cardano-evm.c1.milkomeda.com";
  const wscLib = new WSCLib(MilkomedaNetwork.C1Devnet, oracleUrl, ethUrl, UserWallet.Flint);

  // TODO: we should allow to connect Cardano or Algorand wallets
  const handleConnectWallet = async () => {
    if (!connected) {
      await wscLib.inject();
      // TODO: check if this is necessary for new websites
      // await wscLib.eth_requestAccounts();
      if (window.ethereum !== undefined) {
        setConnected(true);

        const address = await wscLib.eth_getAccount();
        setAddress(address);

        const balance = await wscLib.eth_getBalance();
        setBalance(balance);

        const originAddress = await wscLib.origin_getAddress();
        setOriginAddress(originAddress);
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
      <h1>WSC SDK {connected ? "(Connected)" : ""}</h1>
      <button onClick={handleConnectWallet}>
        {connected ? "Disconnect" : "Connect Cardano Wallet (Devnet)"}
      </button>
      <br />
      {connected && (
        <div>
          <div></div>
          <div>Origin Address: {originAddress}</div>
          <p></p>
          <div>Connected WSC Address: {address}</div>
          <div>Balance: {balance ? balance + " ETH" : "Loading..."}</div>
          <div>
            <h2>Pending</h2>
            <h4>(Here we will show if there are any pending transactions between Cardano and Milkomeda)</h4>
            <div>
              Here we should show all the txs that are not confirmed yet and that they were sent to the smart contract bridge from this address.
            </div>
          </div>
          <div>
            <h2>Assets in Your Cardano Wallet</h2>
            <h4>(We only show the ones that can be moved)</h4>

          </div>
          <div>
            <h2>Assets in Your Wrapped Smart Contract Wallet</h2>
            <h4>(These are the assets held on Milkomeda. You can move them back to your Cardano wallet)</h4>
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Amount</th>
                  <th>Contract Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {balance && (
                  <tr>
                    <td>ADA</td>
                    <td>{balance}</td>
                    <td>
                      <a
                        href={`${wscLib.getExplorerUrl()}/address/0x319f10d19e21188ecF58b9a146Ab0b2bfC894648`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        0x319f...4648
                      </a>
                    </td>
                    <td>
                      <button
                        style={{ backgroundColor: "blue", color: "white" }}
                        onClick={() =>
                          moveAssetsToL1("0x319f10d19e21188ecF58b9a146Ab0b2bfC894648", "ADA")
                        }
                      >
                        Move all to L1
                      </button>
                    </td>
                  </tr>
                )}
                {tokens.map((token: TokenBalance, index) => {
                  const balance = new BigNumber(token.balance);
                  const decimals = new BigNumber(token.decimals);
                  const adjustedBalance = balance.dividedBy(new BigNumber(10).pow(decimals));
                  const shortAddress = `${token.contractAddress.slice(
                    0,
                    6
                  )}...${token.contractAddress.slice(-4)}`;

                  return (
                    <tr key={index}>
                      <td>
                        {token.name} ({token.symbol.toUpperCase()})
                      </td>
                      <td>{adjustedBalance.toString()}</td>
                      <td>
                        <a
                          href={`${wscLib.getExplorerUrl()}/address/${token.contractAddress}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {shortAddress}
                        </a>
                      </td>
                      <td>
                        <button
                          style={{ backgroundColor: "blue", color: "white" }}
                          onClick={() => moveAssetsToL1(token.contractAddress, token.name)}
                        >
                          Move all to L1
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2>Latest 10 Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>Value</th>
                  <th>From / To</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: TransactionResponse, index) => {
                  const localDateTime = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
                  const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;

                  return (
                    <tr key={index}>
                      <td>
                        <a
                          href={`${wscLib.getExplorerUrl()}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {shortHash}
                        </a>
                      </td>
                      <td>{tx.value}</td>
                      <td>
                        <div>{tx.from}</div>
                        <div>to</div>
                        <div>{tx.to}</div>
                      </td>
                      <td>{tx.txreceipt_status === "1" ? "Success" : "Failed"}</td>
                      <td>{localDateTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

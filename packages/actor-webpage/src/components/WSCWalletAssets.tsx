// Add the required imports here

import React from "react";
import WSCLib, { EVMTokenBalance, PendingTx, TransactionResponse } from "../WSCLib";
import PendingManager, { CardanoAmount } from "../PendingManger";
import BigNumber from "bignumber.js";
import CardanoAssets from "./CardanoAssets";

interface WrappedSmartContractWalletAssetsProps {
  connected: boolean;
  address: string;
  destinationBalance: string | null;
  pendingTxs: PendingTx[];
  network: string;
  tokens: EVMTokenBalance[];
  originTokens: CardanoAmount[];
  moveAssetsToL1: (contractAddress: string, name: string) => void;
  wrap: (destination: string | undefined, assetId: string, amount: number) => Promise<void>;
  transactions: TransactionResponse[];
}

const WrappedSmartContractWalletAssets: React.FC<WrappedSmartContractWalletAssetsProps> = ({
  connected,
  address,
  destinationBalance,
  pendingTxs,
  network,
  tokens,
  originTokens,
  moveAssetsToL1,
  wrap,
  transactions,
}) => {
  // Add the code from the original component that's specific to this sub-component
  return (
    <>
      {connected && (
        <div>
          <div>Connected WSC Address: {address}</div>
          <div>Balance: {destinationBalance ? destinationBalance + " mADA" : "Loading..."}</div>
          <div>
            <h2>Pending</h2>
            <h4>
              (Here we will show if there are any pending transactions between Cardano and
              Milkomeda)
            </h4>
            <div>
              Here we should show all the txs that are not confirmed yet and that they were sent to
              the smart contract bridge from this address.
            </div>
            <div>
              {pendingTxs.length != 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Hash</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTxs.map((tx: PendingTx, index) => {
                      const localDateTime = new Date(tx.timestamp * 1000).toLocaleString();
                      const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;

                      return (
                        <tr key={index}>
                          <td>
                            <a
                              href={`${PendingManager.getExplorerUrl(network)}/tx/${tx.hash}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {shortHash}
                            </a>
                          </td>
                          <td>{localDateTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div>
            <CardanoAssets tokens={originTokens} wrap={wrap}/>
          </div>
          <div>
            <h2>Assets in Your Wrapped Smart Contract Wallet</h2>
            <h4>
              (These are the assets held on Milkomeda. You can move them back to your Cardano
              wallet)
            </h4>
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
                {destinationBalance && (
                  <tr>
                    <td>ADA</td>
                    <td>{destinationBalance}</td>
                    <td>
                      <a
                        href={`${PendingManager.getExplorerUrl(
                          network
                        )}/address/0x319f10d19e21188ecF58b9a146Ab0b2bfC894648`}
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
                {tokens.map((token: EVMTokenBalance, index) => {
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
                          href={`${PendingManager.getExplorerUrl(network)}/address/${
                            token.contractAddress
                          }`}
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
            <h4>Here we show you a history of your interactions with Milkomeda and WSC</h4>
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
                          href={`${PendingManager.getExplorerUrl(network)}/tx/${tx.hash}`}
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
      ;
    </>
  );
};

export default WrappedSmartContractWalletAssets;

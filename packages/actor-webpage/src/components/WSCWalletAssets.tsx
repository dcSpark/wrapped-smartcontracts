// Add the required imports here

import React from "react";
import { EVMTokenBalance, PendingTx, TransactionResponse } from "../WSCLib";
import PendingManager, { CardanoAmount } from "../PendingManger";
import CardanoAssets from "./CardanoAssets";
import { PendingTransactions } from "./Pending";
import ActorAssets from "./ActorAssets";

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
  unwrap: (destination: string | undefined, assetId: string, amount: number) => Promise<void>;
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
  unwrap,
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
            <PendingTransactions pendingTxs={pendingTxs} />
          </div>
          <div>
            <CardanoAssets tokens={originTokens} wrap={wrap}/>
          </div>
          <div>
            <ActorAssets destinationBalance={destinationBalance} network={network} tokens={tokens} moveAssetsToL1={moveAssetsToL1} unwrap={unwrap} />
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
                          href={`${PendingManager.getEVMExplorerUrl(network)}/tx/${tx.hash}`}
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

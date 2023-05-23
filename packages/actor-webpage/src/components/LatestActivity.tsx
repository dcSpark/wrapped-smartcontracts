import React from "react";
import { Activity } from "milkomeda-wsc/build/Activity";

interface LatestActivityProps {
  network: string | null;
  transactions: Activity[];
}

/*
Game plan:

  Show the last 10 transactions
  - L2 -> L1
  - L2 -> L2
  - L1 -> L2
*/

const LatestActivity: React.FC<LatestActivityProps> = ({ transactions }) => {
  return (
    <div>
      <h2>Latest 10 Transactions</h2>
      <h4>Here we show you a history of your interactions with Milkomeda and WSC</h4>
      <table>
        <thead>
          <tr>
            <th>Hash</th>
            <th>Value</th>
            <th>To</th>
            <th>Status</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx: Activity, index) => {
            const localDateTime = new Date(tx.timestamp * 1000).toLocaleString();
            const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;
            const addressDisplay =
            tx.destinationAddress.length > 50
              ? `${tx.destinationAddress.slice(0, 39)}...${tx.destinationAddress.slice(-8)}`
              : tx.destinationAddress;

            return (
              <tr key={index}>
                <td>
                  <a
                    // {`${MilkomedaConstants.getEVMExplorerUrl(network)}/tx/${tx.hash}`}
                    href={tx.explorer}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortHash}
                  </a>
                </td>
                <td>
                  {" "}
                  {tx.values
                    .map(
                      (value) =>
                        `${(Number(value.amount) / Math.pow(10, value.decimals)).toFixed(
                          value.decimals
                        )} ${value.token}`
                    )
                    .join(", ")}
                </td>
                <td>
                  <div>{addressDisplay}</div>
                </td>
                <td>{tx.status}</td>
                <td>{tx.type}</td>
                <td>{localDateTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LatestActivity;

import React from "react";
import { PendingTx } from "milkomeda-wsc/build/WSCLibTypes";

interface PendingTransactionsProps {
  pendingTxs: PendingTx[];
}

export const PendingTransactions: React.FC<PendingTransactionsProps> = ({ pendingTxs }) => {
  return (
    <div>
      <h2 className="subtitle">Pending</h2>
      <h4>
        (Here we will show if there are any pending transactions between Cardano and Milkomeda)
      </h4>
      <div>
        Here we should show all the txs that are not confirmed yet and that they were sent to the
        smart contract bridge from this address.
      </div>
      <div>
        {pendingTxs.length !== 0 && (
          <table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Timestamp</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {pendingTxs.map((tx: PendingTx, index) => {
                const localDateTime = new Date(tx.timestamp * 1000).toLocaleString();
                const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;

                return (
                  <tr key={index}>
                    <td>
                      <a href={tx.explorer} target="_blank" rel="noreferrer">
                        {shortHash}
                      </a>
                    </td>
                    <td>{localDateTime}</td>
                    <td>{tx.type === "Wrap" ? "Moving to Milkomeda" : "Moving to L1"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

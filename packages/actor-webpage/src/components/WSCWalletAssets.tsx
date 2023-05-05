// Add the required imports here

import React from "react";
import { EVMTokenBalance, PendingTx } from "../WSCLib";
import { CardanoAmount } from "../PendingManger";
import CardanoAssets from "./CardanoAssets";
import { PendingTransactions } from "./Pending";
import ActorAssets from "./ActorAssets";
import LatestActivity from "./LastestActivity";
import { Activity } from "../Activity";

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
  transactions: Activity[];
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
            <CardanoAssets tokens={originTokens} wrap={wrap} />
          </div>
          <div>
            <ActorAssets
              destinationBalance={destinationBalance}
              network={network}
              tokens={tokens}
              moveAssetsToL1={moveAssetsToL1}
              unwrap={unwrap}
            />
          </div>
          <div>
            <LatestActivity network={network} transactions={transactions} />
          </div>
        </div>
      )}
      ;
    </>
  );
};

export default WrappedSmartContractWalletAssets;

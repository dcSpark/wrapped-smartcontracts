import React from "react";
import L1Assets from "./L1Assets";
import { PendingTransactions } from "./Pending";
import ActorAssets from "./ActorAssets";
import LatestActivity from "./LatestActivity";
import { Activity } from "milkomeda-wsc/build/Activity";
import BigNumber from "bignumber.js";
import { EVMTokenBalance, PendingTx } from "milkomeda-wsc/build/WSCLibTypes";
import { OriginAmount } from "milkomeda-wsc/build/CardanoPendingManger";
import LabelWithValue from "./LabelWithValue";

interface WrappedSmartContractWalletAssetsProps {
  connected: boolean;
  address: string;
  destinationBalance: string | null;
  pendingTxs: PendingTx[];
  network: string;
  tokens: EVMTokenBalance[];
  originTokens: OriginAmount[];
  moveAssetsToL1: (contractAddress: string, name: string, amount: BigNumber) => void;
  wrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<void>;
  unwrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<void>;
  areTokensAllowed: (assetIds: string[]) => Promise<{ [key: string]: boolean }>;
  transactions: Activity[];
  isCardano: boolean;
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
  areTokensAllowed,
  transactions,
  isCardano,
}) => {
  return (
    <>
      {connected && (
        <div className="flex flex-col">
          <div className="section">
            <LabelWithValue label="Connected WSC Address:" value={address} />
            <LabelWithValue
              label="Balance"
              value={destinationBalance ? destinationBalance + (isCardano ? " mADA" : " microALGO") : "Loading..."}
            />
          </div>
          <div className="section">
            <PendingTransactions pendingTxs={pendingTxs} />
          </div>
          <div className="section">
            <L1Assets tokens={originTokens} wrap={wrap} isCardano={isCardano} />
          </div>
          <div className="section">
            <ActorAssets
              destinationBalance={destinationBalance}
              network={network}
              tokens={tokens}
              moveAssetsToL1={moveAssetsToL1}
              unwrap={unwrap}
              areTokensAllowed={areTokensAllowed}
              isCardano={isCardano}
            />
          </div>
          <div className="section">
            <LatestActivity network={network} transactions={transactions} />
          </div>
        </div>
      )}
    </>
  );
};

export default WrappedSmartContractWalletAssets;

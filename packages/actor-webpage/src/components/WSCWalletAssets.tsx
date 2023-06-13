import React, { useState } from "react";
import L1Assets from "./L1Assets";
import { PendingTransactions } from "./Pending";
import ActorAssets from "./ActorAssets";
import LatestActivity from "./LatestActivity";
import { Activity } from "milkomeda-wsc/build/Activity";
import BigNumber from "bignumber.js";
import {
  EVMTokenBalance,
  PendingTx,
  TxOriginSource,
  TxPendingStatus,
} from "milkomeda-wsc/build/WSCLibTypes";
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
  wrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<string>;
  unwrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<string>;
  areTokensAllowed: (assetIds: string[]) => Promise<{ [key: string]: boolean }>;
  getTxStatus: (txHash: string) => Promise<TxPendingStatus>;
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
  getTxStatus,
  transactions,
  isCardano,
}) => {
  const [txHash, setTxHash] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleGetTxStatus = async () => {
    try {
      const status = await getTxStatus(txHash);
      setStatusMessage(status);
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  return (
    <>
      {connected && (
        <div className="flex flex-col">
          <div className="section">
            <LabelWithValue label="Connected WSC Address:" value={address} />
            <LabelWithValue
              label="Balance"
              value={
                destinationBalance
                  ? destinationBalance + (isCardano ? " mADA" : " microALGO")
                  : "Loading..."
              }
            />
          </div>
          <div className="section">
            <h2>Tx Status</h2>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter tx hash"
            />
            <button onClick={handleGetTxStatus}>Check Status</button>
            {statusMessage && <p>{statusMessage}</p>}
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

import React from "react";
import LabelWithValue from "./LabelWithValue";

interface CardanoWalletAssetsProps {
  originAddress: string;
  originBalance: string | null;
}

const Summary: React.FC<CardanoWalletAssetsProps> = ({ originAddress, originBalance }) => {
  return (
    <div className="section">
      <LabelWithValue label="Origin Address:" value={originAddress} />
      <LabelWithValue
        label="Balance:"
        value={originBalance ? originBalance + " ADA" : "Loading..."}
      />
    </div>
  );
};

export default Summary;

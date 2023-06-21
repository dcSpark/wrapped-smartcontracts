import React from "react";
import LabelWithValue from "./LabelWithValue";

interface CardanoWalletAssetsProps {
  originAddress: string;
  originBalance: string | null;
  isCardano: boolean;
}

const Summary: React.FC<CardanoWalletAssetsProps> = ({ originAddress, originBalance, isCardano }) => {
  return (
    <div className="section">
      <LabelWithValue label="Origin Address:" value={originAddress} />
      <LabelWithValue
        label="Balance:"
        value={originBalance ? originBalance + (isCardano ? " mADA" : " mALGO") : "Loading..."}
      />
    </div>
  );
};

export default Summary;

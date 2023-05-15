import React from 'react';

interface CardanoWalletAssetsProps {
  originAddress: string;
  originBalance: string | null;
}

const Summary: React.FC<CardanoWalletAssetsProps> = ({ originAddress, originBalance }) => {
  return (
    <div>
      <div>Origin Address: {originAddress}</div>
      <div>Balance: {originBalance ? originBalance + " ADA" : "Loading..."}</div>
    </div>
  );
};

export default Summary;

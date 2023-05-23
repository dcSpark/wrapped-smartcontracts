import React from 'react';

interface HeaderProps {
  cardanoConnected: boolean;
  algorandConnected: boolean;
  handleConnectWalletCardano: () => void;
  handleConnectWalletAlgorand: () => void;
}

const Header: React.FC<HeaderProps> = ({ cardanoConnected, algorandConnected, handleConnectWalletAlgorand, handleConnectWalletCardano }) => {
  return (
    <div>
      <h1>WSC SDK {cardanoConnected || algorandConnected ? "(Connected)" : ""}</h1>
      <button onClick={handleConnectWalletCardano}>
        {cardanoConnected ? "Disconnect" : "Connect Cardano Wallet (Devnet)"}
      </button>
      <div style={{ width: "10px", display: "inline-block" }} />
      <button onClick={handleConnectWalletAlgorand}>
        {algorandConnected ? "Disconnect" : "Connect Algorand Wallet (Devnet)"}
      </button>
    </div>
  );
};

export default Header;

import React from 'react';

interface HeaderProps {
  connected: boolean;
  handleConnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({ connected, handleConnectWallet }) => {
  return (
    <div>
      <h1>WSC SDK {connected ? "(Connected)" : ""}</h1>
      <button onClick={handleConnectWallet}>
        {connected ? "Disconnect" : "Connect Cardano Wallet (Devnet)"}
      </button>
    </div>
  );
};

export default Header;

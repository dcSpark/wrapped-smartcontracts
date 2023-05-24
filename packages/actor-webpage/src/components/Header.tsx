import React from "react";

interface HeaderProps {
  cardanoConnected: boolean;
  algorandConnected: boolean;
  handleConnectWalletCardano: () => void;
  handleConnectWalletAlgorand: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cardanoConnected,
  algorandConnected,
  handleConnectWalletAlgorand,
  handleConnectWalletCardano,
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl text-center mb-8">
        WSC SDK {cardanoConnected || algorandConnected ? "(Connected)" : ""}
      </h1>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button
          className={cardanoConnected ? "button-secondary" : "button-primary"}
          onClick={handleConnectWalletCardano}
        >
          {cardanoConnected ? "Disconnect" : "Connect Cardano Wallet (Devnet)"}
        </button>
        <button
          className={algorandConnected ? "button-secondary" : "button-primary"}
          onClick={handleConnectWalletAlgorand}
        >
          {algorandConnected ? "Disconnect" : "Connect Algorand Wallet (Devnet)"}
        </button>
      </div>
    </div>
  );
};

export default Header;

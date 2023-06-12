import React, { useState } from "react";

interface HeaderProps {
  cardanoConnected: boolean;
  algorandConnected: boolean;
  handleConnectWalletCardano: (option: string) => void;
  handleConnectWalletAlgorand: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cardanoConnected,
  algorandConnected,
  handleConnectWalletAlgorand,
  handleConnectWalletCardano,
}) => {
  const [showCardanoOptions, setShowCardanoOptions] = useState(false);
  const cardanoOptions = [
    { name: "Flint Wallet", value: "flint" },
    { name: "Eternl", value: "eternl" },
    { name: "Nami", value: "nami" },
  ];

  const handleClickOption = (optionValue: string) => {
    handleConnectWalletCardano(optionValue);
    setShowCardanoOptions(false); // close dropdown after selection
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl text-center mb-8">
        WSC SDK {cardanoConnected || algorandConnected ? "(Connected)" : ""}
      </h1>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <div
          className="relative"
          onMouseEnter={() => setShowCardanoOptions(true)}
          onMouseLeave={() => setShowCardanoOptions(false)}
        >
          <button className={cardanoConnected ? "button-secondary" : "button-primary"}>
            {cardanoConnected ? "Disconnect" : "Connect Cardano Wallet (Devnet)"}
          </button>
          {showCardanoOptions && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 top-0 mt-10 bg-white border rounded shadow overflow-auto max-h-48"
              style={{ width: "max-content" }}
            >
              {cardanoOptions.map((option, index) => (
                <button
                  key={index}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  onClick={() => handleClickOption(option.value)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>
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

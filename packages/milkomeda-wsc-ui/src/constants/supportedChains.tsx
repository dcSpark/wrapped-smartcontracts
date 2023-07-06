import React from "react";
import { ReactNode } from "react";
import Logos from "../assets/chains";

type Chain = { id: number; name: string; logo: ReactNode };
const supportedChains: Chain[] = [
  {
    id: 1,
    name: "Ethereum",
    logo: <Logos.Ethereum />,
  },
  {
    id: 3,
    name: "Rinkeby",
    logo: <Logos.Ethereum testnet />,
  },
  {
    id: 4,
    name: "Ropsten",
    logo: <Logos.Ethereum testnet />,
  },
  {
    id: 5,
    name: "Görli",
    logo: <Logos.Ethereum testnet />,
  },
  {
    id: 42,
    name: "Kovan",
    logo: <Logos.Ethereum testnet />,
  },
  {
    id: 10,
    name: "Optimism",
    logo: <Logos.Optimism />,
  },
  {
    id: 69, // nice
    name: "Optimism Kovan",
    logo: <Logos.Optimism testnet />,
  },
  {
    id: 420, // nice
    name: "Optimism Goerli",
    logo: <Logos.Optimism testnet />,
  },
  {
    id: 137,
    name: "Polygon",
    logo: <Logos.Polygon />,
  },
  {
    id: 80001,
    name: "Polygon Mumbai",
    logo: <Logos.Polygon testnet />,
  },
  {
    id: 31337,
    name: "Hardhat",
    logo: <Logos.Ethereum testnet />,
  },
  {
    id: 1337,
    name: "Localhost",
    logo: <Logos.Ethereum testnet />,
  },
  {
    id: 42161,
    name: "Arbitrum",
    logo: <Logos.Arbitrum />,
  },
  {
    id: 421611,
    name: "Arbitrum Rinkeby",
    logo: <Logos.Arbitrum testnet />,
  },
  {
    id: 421613,
    name: "Arbitrum Goerli",
    logo: <Logos.Arbitrum testnet />,
  },
  {
    id: 40,
    name: "Telos",
    logo: <Logos.Telos />,
  },
  {
    id: 41,
    name: "Telos Testnet",
    logo: <Logos.Telos testnet />,
  },
  {
    id: 1313161554,
    name: "Aurora",
    logo: <Logos.Aurora />,
  },
  {
    id: 1313161555,
    name: "Aurora Testnet",
    logo: <Logos.Aurora testnet />,
  },
  {
    id: 43_114,
    name: "Avalanche",
    logo: <Logos.Avalanche />,
  },
  {
    id: 43_113,
    name: "Avalanche Fuji",
    logo: <Logos.Avalanche testnet />,
  },
  {
    id: 31337,
    name: "Foundry",
    logo: <Logos.Foundry testnet />,
  },
  {
    id: 100,
    name: "Gnosis",
    logo: <Logos.Gnosis />,
  },
  {
    id: 9001,
    name: "Evmos",
    logo: <Logos.Evmos />,
  },
  {
    id: 9000,
    name: "Evmos Testnet",
    logo: <Logos.Evmos testnet />,
  },
  {
    id: 56,
    name: "BNB Smart Chain",
    logo: <Logos.BinanceSmartChain />,
  },
  {
    id: 97,
    name: "Binance Smart Chain Testnet",
    logo: <Logos.BinanceSmartChain testnet />,
  },
  {
    id: 11155111,
    name: "Sepolia",
    logo: <Logos.Sepolia />,
  },
  {
    id: 841,
    name: "Taraxa",
    logo: <Logos.Taraxa />,
  },
  {
    id: 842,
    name: "Taraxa Testnet",
    logo: <Logos.Taraxa testnet />,
  },
  {
    id: 324,
    name: "zkSync",
    logo: <Logos.zkSync />,
  },
  {
    id: 280,
    name: "zkSync Testnet",
    logo: <Logos.zkSync testnet />,
  },
  {
    id: 42_220,
    name: "Celo",
    logo: <Logos.Celo />,
  },
  {
    id: 44_787,
    name: "Celo Alfajores",
    logo: <Logos.Celo testnet />,
  },
  {
    id: 7_700,
    name: "Canto",
    logo: <Logos.Canto />,
  },
  {
    id: 250,
    name: "Fantom",
    logo: <Logos.Fantom />,
  },
  {
    id: 4_002,
    name: "Fantom Testnet",
    logo: <Logos.Fantom testnet />,
  },
  {
    id: 14,
    name: "Flare",
    logo: <Logos.Flare />,
  },
  {
    id: 114,
    name: "Coston2",
    logo: <Logos.Flare />,
  },
  {
    id: 314,
    name: "Filecoin",
    logo: <Logos.Filecoin />,
  },
  {
    id: 314_1,
    name: "Filecoin Hyperspace",
    logo: <Logos.Filecoin testnet />,
  },
  {
    id: 314_159,
    name: "Filecoin Calibration",
    logo: <Logos.Filecoin testnet />,
  },
  {
    id: 1_088,
    name: "Metis",
    logo: <Logos.Metis />,
  },
  {
    id: 599,
    name: "Metis Goerli",
    logo: <Logos.Metis testnet />,
  },
  {
    id: 4_689,
    name: "IoTeX",
    logo: <Logos.IoTeX />,
  },
  {
    id: 4_690,
    name: "IoTeX Testnet",
    logo: <Logos.IoTeX testnet />,
  },
];

export default supportedChains;

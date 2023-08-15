/* eslint @typescript-eslint/no-explicit-any: "off" */
import type { NextPage } from "next";
import { ConnectWSCButton, useWSCProvider } from "milkomeda-wsc-ui";
import { TransactionConfigWSCProvider } from "milkomeda-wsc-ui";
import type { TransactionConfigWSCOptions } from "milkomeda-wsc-ui";

import vendingMachineM3S6Abi from "../abi/m3s6.json";
import { ethers } from "ethers";
import Link from "next/link";
import { useAccount } from "wagmi";

const VENDING_MACHINE_ADDRESS = "0x5a5697633e93d7C5D319c5362B4A49f87445e33D";

const evmTokenAddress = "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F";
const Home: NextPage = () => {
  const { isWSCConnected } = useWSCProvider();
  const { address: account } = useAccount();

  const buyOptions: TransactionConfigWSCOptions = {
    defaultWrapToken: {
      unit: "lovelace",
      amount: "1000000000000000000",
    },
    defaultUnwrapToken: {
      unit: evmTokenAddress,
      amount: "10000000",
    },
    titleModal: "Buy M3S6 Coin",
    evmTokenAddress: evmTokenAddress,
    evmContractRequest: {
      address: VENDING_MACHINE_ADDRESS,
      abi: vendingMachineM3S6Abi.abi,
      functionName: "buyTokens",
      args: [account],
      overrides: {
        value: ethers.BigNumber.from("1000000000000000000"),
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        height: "100vh",
      }}
    >
      <TransactionConfigWSCProvider options={buyOptions}>
        <ConnectWSCButton />
      </TransactionConfigWSCProvider>
      {isWSCConnected && <Link href="/wsc-interface">Check WSC Interface</Link>}
    </div>
  );
};

export default Home;

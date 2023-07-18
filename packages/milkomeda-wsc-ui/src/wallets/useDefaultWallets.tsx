import { getWallets } from "./index";
import { WalletProps } from "./wallet";

import { useConnect } from "wagmi";

function useDefaultWallets(): WalletProps[] | any {
  const defaultWallets: string[] = [];

  // define the order of the wallets
  defaultWallets.push("flint", "eternl");

  const wallets = getWallets();
  return wallets.filter((wallet) => defaultWallets.includes(wallet.id));
}

export default useDefaultWallets;

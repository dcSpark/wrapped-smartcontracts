import { getWallets } from "./index";
import { WalletProps } from "./wallet";

function useDefaultWallets(): WalletProps[] {
  const defaultWallets: string[] = [];

  // define the order of the wallets
  defaultWallets.push("flint", "eternl");

  const wallets = getWallets();
  return wallets.filter((wallet) => defaultWallets.includes(wallet.id));
}

export default useDefaultWallets;

import algosdk from "algosdk";
import { IPendingManager, MilkomedaNetworkName, PendingTx } from "./WSCLibTypes";
import { PendingManager } from "./PendingManager";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AlgoPendingManager extends PendingManager implements IPendingManager {
  algod: typeof algosdk;

  constructor(
    algod: typeof algosdk,
    network: MilkomedaNetworkName,
    userL1Address: string,
    evmAddress: string
  ) {
    super(network, userL1Address, evmAddress);
    this.algod = algod;
  }

  //
  // Pending Transactions
  //
  async getPendingTransactions(): Promise<PendingTx[]> {
    const algorandPendingTxs = await this.getAlgorandPendingTxs();
    const evmPendingTxs = await this.getEVMPendingTxs();
    return [...algorandPendingTxs, ...evmPendingTxs];
  }

  //
  // Algorand
  //
  async getAlgorandPendingTxs(): Promise<PendingTx[]> {
    // TODO:
    // - fetch recent txs from algod for userL1Address
    // - get milkomeda stargate url (missing stargate for algorand)
    // -
    return [];
  }
}

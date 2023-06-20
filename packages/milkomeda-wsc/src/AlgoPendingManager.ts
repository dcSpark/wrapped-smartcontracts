import algosdk from "algosdk";
import { IPendingManager, MilkomedaNetworkName, PendingTx, PendingTxType } from "./WSCLibTypes";
import { PendingManager } from "./PendingManager";
import { AlgoStargateApiResponse } from "./CardanoPendingManger";
import { MilkomedaConstants } from "./MilkomedaConstants";
import { MilkomedaNetwork } from "./MilkomedaNetwork";

export interface BetterNameTransaction {
  tx_hash: string;
  tx_index: number;
  block_height: number;
  block_time: number;
}

interface AlgoExplorerTx {
  "block-rewards-level": number;
  "close-rewards": number;
  "closing-amount": number;
  "confirmed-round": number;
  fee: number;
  "first-valid": number;
  id: string;
  index: number;
  "inner-tx-offset": number;
  "intra-round-offset": number;
  "last-valid": number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logs: any[];
  note?: string;
  decodedNote?: string;
  destinationFromNote?: string;
  "payment-transaction"?: {
    amount: number;
    "close-acc-rewards": number;
    "close-amount": number;
    "close-balance": number;
    receiver: string;
    "receiver-acc-rewards": number;
    "receiver-balance": number;
    "receiver-tx-counter": number;
  };
  "receiver-rewards": number;
  "round-time": number;
  sender: string;
  "sender-acc-rewards": number;
  "sender-balance": number;
  "sender-rewards": number;
  "sender-tx-counter": number;
  signature: {
    sig: string;
  };
  "tx-type": string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "asset-transfer-transaction"?: any;
}

interface ApiResponse {
  transactions: AlgoExplorerTx[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AlgoPendingManager extends PendingManager implements IPendingManager {
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

  static async fetchFromStargate(url: string): Promise<AlgoStargateApiResponse> {
    try {
      const response = await fetch(url);
      const data: AlgoStargateApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data from URL:", error);
      throw error;
    }
  }

  //
  // Pending Transactions
  //
  async getPendingTransactions(): Promise<PendingTx[]> {
    const algorandPendingTxs = await this.getAlgorandPendingTxs();
    const evmPendingTxs = await this.getEVMPendingTxs();
    return [...algorandPendingTxs, ...evmPendingTxs];
  }

  async fetchRecentTransactions(address: string): Promise<AlgoExplorerTx[]> {
    const url =
      MilkomedaConstants.getAlgorandExplorerUrl(this.network) +
      `/rl/v1/transactions?page=1&&limit=20&&address=${address}`;
    const response = await fetch(url);
    const data: ApiResponse = await response.json();

    for (const transaction of data.transactions) {
      if (transaction.note) {
        const base64 = transaction.note;
        const decodedString = Buffer.from(base64, "base64").toString();

        if (decodedString.startsWith("milkomeda/a1")) {
          transaction.decodedNote = decodedString;
          transaction.destinationFromNote = decodedString.split(":u")[2];
        }
      }
    }

    const twoHoursAgoUnix = Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000);
    const recentTransactions = data.transactions.filter(
      (transaction) =>
        transaction["round-time"] &&
        transaction["round-time"] > twoHoursAgoUnix &&
        transaction.decodedNote
    );

    return recentTransactions as AlgoExplorerTx[];
  }

  //
  // Algorand
  //
  async getAlgorandPendingTxs(): Promise<PendingTx[]> {
    // fetch recent txs from algod for userL1Address
    // get milkomeda stargate url (missing stargate for algorand)
    let txs: AlgoExplorerTx[];
    try {
      txs = await this.fetchRecentTransactions(this.userL1Address);
      if (txs.length === 0) return [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return [];
      }
      throw error;
    }

    const stargate = await AlgoPendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );

    // check if txs are from the user to the bridge address.
    const txsToBridge = await txs.filter(
      (tx) => tx["payment-transaction"]?.receiver === stargate.current_address
    );

    // check if bridgeTxs exist in the bridge API (if they don't it means that they are pending)
    // this is a *very* inefficient way to do this, but it's the only way until we get a better API
    const bridgeRequests = await MilkomedaNetwork.fetchBridgeRequests(this.network);
    console.log("Bridge Requests: ", bridgeRequests);

    const processedTxHashes = bridgeRequests.map((request) => request.mainchain_tx_id);
    const pendingTxs = txsToBridge.filter((tx) => !processedTxHashes.includes(tx.id));
    console.log("Algo pendingTxs: ", pendingTxs);

    const pendingTxs_normalized = pendingTxs.map((tx) => ({
      hash: tx.id,
      timestamp: tx["round-time"],
      explorer: MilkomedaConstants.getAlgorandExplorerUrl(this.network) + "/tx/" + tx.id,
      type: PendingTxType.Wrap,
      destinationAddress: tx.destinationFromNote ?? "EVM Address",
    }));

    // this code check for pending txs detected by the bridge that are being unwrapped
    const bridgePendingTxs = bridgeRequests.filter(
      (request) =>
        !request.executed_timestamp && request.to.toLowerCase() === this.evmAddress.toLowerCase()
    );
    const bridgePendingTxs_normalized = bridgePendingTxs.map((tx) => ({
      hash: tx.transaction_id,
      timestamp: tx.timestamp,
      explorer:
        MilkomedaConstants.getCardanoExplorerUrl(this.network) +
        "/transaction/" +
        tx.transaction_id,
      type: PendingTxType.Wrap,
      destinationAddress: tx.from,
    }));

    return [...pendingTxs_normalized, ...bridgePendingTxs_normalized].sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }
}

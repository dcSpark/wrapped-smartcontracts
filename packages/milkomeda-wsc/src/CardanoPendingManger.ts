import { Blockfrost } from "lucid-cardano";
import { IPendingManager, MilkomedaNetworkName, PendingTx, PendingTxType } from "./WSCLibTypes";
import { MilkomedaNetwork } from "./MilkomedaNetwork";
import { MilkomedaConstants } from "./MilkomedaConstants";
import { PendingManager } from "./PendingManager";

export interface CardanoAmount {
  unit: string;
  quantity: string;
  decimals: number | null;
  bridgeAllowed: boolean | undefined;
  fingerprint: string | undefined;
  assetName: string | undefined;
}

export interface CardanoInput {
  address: string;
  amount: CardanoAmount[];
  tx_hash: string;
  output_index: number;
  data_hash: string;
  inline_datum: string;
  reference_script_hash: string;
  collateral: boolean;
  reference: boolean;
}

export interface CardanoOutput {
  address: string;
  amount: CardanoAmount[];
  output_index: number;
  data_hash: string;
  inline_datum: string;
  collateral: boolean;
  reference_script_hash: string;
}

export interface CardanoUTXOResponse {
  hash: string;
  inputs: CardanoInput[];
  outputs: CardanoOutput[];
}

export interface CardanoBlockfrostTransaction {
  tx_hash: string;
  tx_index: number;
  block_height: number;
  block_time: number;
}

export interface StargateAsset {
  idCardano: string;
  idMilkomeda: string;
  fingerprint: string | undefined;
  minCNTInt: string;
  minGWei: string;
}

export interface StargateADA {
  minLovelace: string;
  fromADAFeeLovelace: string;
  toADAFeeGWei: string;
}

export interface StargateApiResponse {
  current_address: string;
  ttl_expiry: number;
  ada: StargateADA;
  assets: StargateAsset[];
}

export interface ExplorerTransaction {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  isError: string;
  nonce: string;
  timeStamp: string;
  to: string;
  transactionIndex: string;
  txreceipt_status: string;
  value: string;
}

class CardanoPendingManager extends PendingManager implements IPendingManager {
  blockfrost: Blockfrost;

  constructor(
    blockfrost: Blockfrost,
    network: MilkomedaNetworkName,
    userL1Address: string,
    evmAddress: string
  ) {
    super(network, userL1Address, evmAddress);
    this.blockfrost = blockfrost;
  }

  //
  // Pending Transactions
  //
  async getPendingTransactions(): Promise<PendingTx[]> {
    const cardanoPendingTxs = await this.getCardanoPendingTxs();
    const evmPendingTxs = await this.getEVMPendingTxs();
    return [...cardanoPendingTxs, ...evmPendingTxs];
  }

  async fetchRecentTransactions(address: string): Promise<CardanoBlockfrostTransaction[]> {
    const url = this.blockfrost.url + `/addresses/${address}/transactions`;
    const response = await fetch(url, {
      headers: {
        project_id: this.blockfrost.projectId,
      },
    });
    const transactions: CardanoBlockfrostTransaction[] = await response.json();

    const twentyFourHoursAgo = Date.now() / 1000 - 24 * 60 * 60;
    const recentTransactions = transactions.filter((tx) => tx.block_time > twentyFourHoursAgo);

    return recentTransactions;
  }

  //
  // Cardano
  //
  async getCardanoPendingTxs(): Promise<PendingTx[]> {
    // Check all the txs for the past 24 hrs to the bridge SC from the user
    // Check the bridge API and make sure that they haven't been confirmed
    const txs = await this.fetchRecentTransactions(this.userL1Address);
    if (txs.length === 0) return [];

    const stargate = await CardanoPendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );

    // check if txs are from the user to the bridge address.
    const txsToBridge = await txs.filter(async (tx) => {
      const txUtxos = await this.fetchUTXOForTx(tx.tx_hash);
      const isBridgeAddressUsed = txUtxos.outputs.some(
        (utxo) => utxo.address === stargate.current_address
      );
      return isBridgeAddressUsed;
    });

    // check if bridgeTxs exist in the bridge API (if they don't it means that they are pending)
    // this is a *very* inefficient way to do this, but it's the only way until we have a better API
    const bridgeRequests = await MilkomedaNetwork.fetchBridgeRequests(this.network);
    const processedTxHashes = bridgeRequests.map((request) => request.mainchain_tx_id);
    const pendingTxs = txsToBridge.filter((tx) => !processedTxHashes.includes(tx.tx_hash));

    const pendingTxs_normalized = pendingTxs.map((tx) => ({
      hash: tx.tx_hash,
      timestamp: tx.block_time,
      explorer:
        MilkomedaConstants.getCardanoExplorerUrl(this.network) + "/transaction/" + tx.tx_hash,
      type: PendingTxType.Wrap,
      destinationAddress: "EVM Address", // TODO: eventually find the address in the metadata
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

  async fetchUTXOForTx(txHash: string): Promise<CardanoUTXOResponse> {
    const url = this.blockfrost.url + `/txs/${txHash}/utxos`;
    const response = await fetch(url, {
      headers: {
        project_id: this.blockfrost.projectId,
      },
    });
    const utxoDetails: CardanoUTXOResponse = await response.json();

    return utxoDetails;
  }

  static async fetchFromStargate(url: string): Promise<StargateApiResponse> {
    try {
      const response = await fetch(url);
      const data: StargateApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data from URL:", error);
      throw error;
    }
  }
}

export default CardanoPendingManager;
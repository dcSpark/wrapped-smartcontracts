// import { milkomedaNetworks } from "@dcspark/milkomeda-js-sdk";
import { Blockfrost } from "lucid-cardano";
import { MilkomedaNetwork, PendingTx, TransactionResponse } from "./WSCLib";

export interface CardanoAmount {
  unit: string;
  quantity: string;
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

export interface BridgeRequest {
  transaction_id: string;
  mainchain_tx_id: string;
  from: string;
  to: string;
  block_number: number;
  timestamp: number;
  executed_timestamp: number;
  invalidated: boolean;
  assets: any[];
}

export interface BridgeRequestsResponse {
  requests: BridgeRequest[];
}

class PendingManager {
  blockfrost: any;
  network: MilkomedaNetwork;
  userL1Address: string;
  evmAddress: string;

  constructor(blockfrost: Blockfrost, network: MilkomedaNetwork, userL1Address: string, evmAddress: string) {
    this.blockfrost = blockfrost;
    this.network = network;
    this.userL1Address = userL1Address;
    this.evmAddress = evmAddress;
  }

  static getExplorerUrl(network: string): string {
    switch (network) {
      case MilkomedaNetwork.C1Mainnet:
        return "https://explorer-mainnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetwork.C1Devnet:
        return "https://explorer-devnet-cardano-evm.c1.milkomeda.com";
      case MilkomedaNetwork.A1Mainnet:
        return "https://explorer-mainnet-algorand-evm.a1.milkomeda.com";
      case MilkomedaNetwork.A1Devnet:
        return "https://explorer-devnet-algorand-evm.a1.milkomeda.com";
      default:
        throw new Error("Invalid network");
    }
  }

  static getMilkomedaStargateUrl(network: string): string {
    switch (network) {
      case MilkomedaNetwork.C1Mainnet:
        return "https://allowlist-mainnet.flint-wallet.com/v1/stargate";
      case MilkomedaNetwork.C1Devnet:
        return "https://allowlist.flint-wallet.com/v1/stargate";
      case MilkomedaNetwork.A1Mainnet:
        throw new Error("Algorand not supported yet");
      case MilkomedaNetwork.A1Devnet:
        throw new Error("Algorand not supported yet");
      default:
        throw new Error("Invalid network");
    }
  }

  static getBridgeAPIUrl(network: string): string {
    switch (network) {
      case MilkomedaNetwork.C1Mainnet:
        throw new Error("Need to add Bridge API URL for C1 Mainnet");
      case MilkomedaNetwork.C1Devnet:
        return "https://ada-bridge-devnet-cardano-evm.c1.milkomeda.com/api/v1";
      case MilkomedaNetwork.A1Mainnet:
        throw new Error("Need to add Bridge API URL for A1 Mainnet");
      case MilkomedaNetwork.A1Devnet:
        throw new Error("Need to add Bridge API URL for A1 Devnet");
      default:
        throw new Error("Invalid network");
    }
  }

  static getBridgeEVMAddress(network: string): string {
    switch (network) {
      case MilkomedaNetwork.C1Mainnet:
        throw new Error("Need to add Bridge API URL for C1 Mainnet");
      case MilkomedaNetwork.C1Devnet:
        return "0x319f10d19e21188ecf58b9a146ab0b2bfc894648";
      case MilkomedaNetwork.A1Mainnet:
        throw new Error("Need to add Bridge API URL for A1 Mainnet");
      case MilkomedaNetwork.A1Devnet:
        throw new Error("Need to add Bridge API URL for A1 Devnet");
      default:
        throw new Error("Invalid network");
    }
  }

  //
  // Pending Transactions
  //
  async getPendingTransactions(): Promise<PendingTx[]> {
    const cardanoPendingTxs = await this.getCardanoPendingTxs();
    const evmPendingTxs = await this.getEVMPEndingTxs();
    return [...cardanoPendingTxs, ...evmPendingTxs];
  }
  
  async fetchRecentTransactions(address: string): Promise<CardanoBlockfrostTransaction[]> {
    const url = this.blockfrost.url + `/addresses/${address}/transactions`;
    const response = await fetch(url, {
      headers: {
        'project_id': this.blockfrost.projectId
      }
    });
    const transactions: CardanoBlockfrostTransaction[] = await response.json();

    const twentyFourHoursAgo = Date.now() / 1000 - 24 * 60 * 60;
    const recentTransactions = transactions.filter((tx) => tx.block_time > twentyFourHoursAgo);

    return recentTransactions;
  }

  //
  // EVM
  //
  async getEVMPEndingTxs(): Promise<PendingTx[]> {
    // Check all the txs for the past 24 hrs to the bridge SC from the user
    // Check the bridge API and make sure that they haven't been confirmed

    const bridgeAddress = PendingManager.getBridgeEVMAddress(this.network);
    const txsToBridge = await this.getTransactionsToBridgeFromAddress(this.evmAddress, bridgeAddress);
    if (txsToBridge.length === 0) return [];
   
    // check if bridgeTxs exist in the bridge API (if they don't it means that they are pending)
    // this is a *very* inefficient way to do this, but it's the only way until we have a better API
    const bridgeRequests = await this.fetchBridgeRequests();
    const processedTxHashes = bridgeRequests.requests.map((request) => request.transaction_id);
    console.log("processedTxHashes", processedTxHashes);

    const pendingTxs = txsToBridge.filter((tx) => !processedTxHashes.includes(tx.hash));

    const pendingTxs_normalized = pendingTxs.map((tx) => ({
      hash: tx.hash,
      timestamp: parseInt(tx.timeStamp),
    }));

    return pendingTxs_normalized;
  }

  private async filterTransaction(transaction: any, address: string, bridgeAddress: string): Promise<boolean> {
    const traceApiUrl = PendingManager.getExplorerUrl(this.network) + `/api?module=account&action=txlistinternal&txhash=${transaction.hash}`;
    const traceResponse = await fetch(traceApiUrl);
    const trace = await traceResponse.json();
  
    let goingToBridge = false;   
    for (const traceItem of trace.result) {
      if (traceItem.from.toLowerCase() === address.toLowerCase() && traceItem.to.toLowerCase() === bridgeAddress.toLowerCase()) {
        goingToBridge = true;
      }
      if (traceItem.isError === "1") {
        return false;
      }
    }
    return goingToBridge;
  }

  async getTransactionsToBridgeFromAddress(address: string, bridgeAddress: string): Promise<any[]> {
    const dayAgoTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    const apiUrl = PendingManager.getExplorerUrl(this.network) + `/api?module=account&action=txlist&address=${address}&starttimestamp=${dayAgoTimestamp}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const filteredTransactionPromises = data.result.map(async (transaction: any) => {
      if (transaction.hash=== "0x2b7e1895ec9872d7e1e7d2caaaf070247fbae5e75498fd2dd7e30ab56cd44405") console.log(transaction)
      const shouldIncludeTransaction = await this.filterTransaction(transaction, address, bridgeAddress);
      return shouldIncludeTransaction ? transaction : null;
    });
    
    const filteredTransactionsWithNulls = await Promise.all(filteredTransactionPromises);
    const filteredTransactions = filteredTransactionsWithNulls.filter(transaction => transaction !== null);
    return filteredTransactions;
  }

  //
  // Cardano
  //
  async getCardanoPendingTxs(): Promise<PendingTx[]> {
    // Check all the txs for the past 24 hrs to the bridge SC from the user
    // Check the bridge API and make sure that they haven't been confirmed
    const txs = await this.fetchRecentTransactions(this.userL1Address);
    if (txs.length === 0) return [];

    const stargate = await PendingManager.fetchFromStargate(PendingManager.getMilkomedaStargateUrl(this.network));

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
    const bridgeRequests = await this.fetchBridgeRequests();
    const processedTxHashes = bridgeRequests.requests.map((request) => request.mainchain_tx_id);
    const pendingTxs = txsToBridge.filter((tx) => !processedTxHashes.includes(tx.tx_hash));

    const pendingTxs_normalized = pendingTxs.map((tx) => ({
      hash: tx.tx_hash,
      timestamp: tx.block_time,
    }));

    return pendingTxs_normalized;
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

  async fetchBridgeRequests(): Promise<BridgeRequestsResponse> {
    const url = PendingManager.getBridgeAPIUrl(this.network) + `/requests?sort=Desc&count=100`;
    const response = await fetch(url);
    const bridgeRequests: BridgeRequestsResponse = await response.json();

    return bridgeRequests;
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

export default PendingManager;

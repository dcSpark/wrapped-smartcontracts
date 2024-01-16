import { ExplorerTransaction } from "./CardanoPendingManger";
import { MilkomedaConstants } from "./MilkomedaConstants";
import { MilkomedaNetwork } from "./MilkomedaNetwork";
import { MilkomedaNetworkName, PendingTx, PendingTxType } from "./WSCLibTypes";

export class PendingManager {
  network: MilkomedaNetworkName;
  userL1Address: string;
  evmAddress: string;

  constructor(network: MilkomedaNetworkName, userL1Address: string, evmAddress: string) {
    this.network = network;
    this.userL1Address = userL1Address;
    this.evmAddress = evmAddress;
  }

  async isMainchainTxBridgeConfirmed(txHash: string): Promise<boolean | null> {
    const txRequest = await MilkomedaNetwork.searchMainchainTxInBridge(this.network, txHash);
    if (!txRequest) return null;
    return txRequest.executed_timestamp != null && !txRequest.invalidated;
  }

  async isMilkomedaTxBridgeConfirmed(txHash: string): Promise<boolean | null> {
    const txRequest = await MilkomedaNetwork.searchMilkomedaTxInBridge(this.network, txHash);
    if (!txRequest) return null;
    return txRequest.executed_timestamp != null && !txRequest.invalidated;
  }

  async getEVMPendingTxs(): Promise<PendingTx[]> {
    // Check all the txs for the past 24 hrs to the bridge SC from the user
    // Check the bridge API and make sure that they haven't been confirmed
    const bridgeRequests = await MilkomedaNetwork.fetchBridgeRequests(
      this.network,
      100,
      `&evm_address=${this.evmAddress}&request_status=Pending`
    );

    // this code check for pending txs detected by the bridge that are being unwrapped
    const bridgePendingTxs = bridgeRequests.filter(
      (request) =>
        // TODO: eventually we want to use [unwrapping_transaction].mainchain_tx_id instead
        // and then check for the tx in the mainchain mempool
        !request.executed_timestamp && request.from.toLowerCase() === this.evmAddress.toLowerCase()
    );
    const bridgePendingTxs_normalized = bridgePendingTxs.map((tx) => ({
      hash: tx.transaction_id,
      timestamp: tx.timestamp,
      explorer: MilkomedaConstants.getEVMExplorerUrl(this.network) + "/tx/" + tx.transaction_id,
      type: PendingTxType.Unwrap,
      destinationAddress: tx.to,
    }));

    return [...bridgePendingTxs_normalized].sort((a, b) => b.timestamp - a.timestamp);
  }

  private async filterTransaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any,
    address: string,
    bridgeAddress: string
  ): Promise<boolean> {
    const traceApiUrl =
      MilkomedaConstants.getEVMExplorerUrl(this.network) +
      `/api?module=account&action=txlistinternal&txhash=${transaction.hash}`;
    const traceResponse = await fetch(traceApiUrl);
    const trace = await traceResponse.json();

    let goingToBridge = false;
    for (const traceItem of trace.result) {
      if (
        traceItem.from.toLowerCase() === address.toLowerCase() &&
        traceItem.to.toLowerCase() === bridgeAddress.toLowerCase()
      ) {
        goingToBridge = true;
      }
      if (traceItem.isError === "1") {
        return false;
      }
    }
    return goingToBridge;
  }

  // deprecated
  async getTransactionsToBridgeFromAddress(
    address: string,
    bridgeAddress: string
  ): Promise<ExplorerTransaction[]> {
    const dayAgoTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    const apiUrl =
      MilkomedaConstants.getEVMExplorerUrl(this.network) +
      `/api?module=account&action=txlist&address=${address}&starttimestamp=${dayAgoTimestamp}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const filteredTransactionPromises = data.result.map(
      async (transaction: ExplorerTransaction) => {
        const shouldIncludeTransaction = await this.filterTransaction(
          transaction,
          address,
          bridgeAddress
        );
        return shouldIncludeTransaction ? transaction : null;
      }
    );

    const filteredTransactionsWithNulls = await Promise.all(filteredTransactionPromises);
    const filteredTransactions = filteredTransactionsWithNulls.filter(
      (transaction) => transaction !== null
    );
    return filteredTransactions;
  }
}

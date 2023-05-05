import { MilkomedaConstants } from "./MilkomedaConstants";
import { MilkomedaNetwork } from "./MilkomedaNetwork";
import { MilkomedaNetworkName, PendingTx, PendingTxType } from "./WSCLib";

export enum ActivityStatus {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
}

export interface Activity extends PendingTx {
  status: ActivityStatus;
}

export class ActivityManager {

  static async getL2Activity(): Promise<Activity[]> {
    // get transactions from the Milkomeda Explorer

    return [];
  }

  static async getBridgeActivity(
    network: MilkomedaNetworkName,
    evmAddress: string
  ): Promise<Activity[]> {
    const bridgeRequests = await MilkomedaNetwork.fetchBridgeRequests(network);
    // TODO: sync with Rinor/ Grzegorz on a cache strategy for the API
    const userToL2 = bridgeRequests.filter((request) => request.to.toLowerCase() === evmAddress.toLowerCase());
    const userToL1 = bridgeRequests.filter((request) => request.from.toLowerCase() === evmAddress.toLowerCase());

    const normalized = [...userToL1, ...userToL2].map((request) => {
      const isCompleted = request.executed_timestamp;
      const isFailed = request.invalidated;

      let status: ActivityStatus;
      if (isCompleted) {
        status = ActivityStatus.Completed;
      } else if (isFailed) {
        status = ActivityStatus.Failed;
      } else {
        status = ActivityStatus.Pending;
      }

      return {
        hash: request.transaction_id,
        timestamp: request.timestamp,
        explorer: MilkomedaConstants.getEVMExplorerUrl(network) + "/tx/" + request.transaction_id,
        type: request.to === evmAddress ? PendingTxType.Wrap : PendingTxType.Unwrap,
        destinationAddress: request.to,
        status,
      };
    });

    return normalized;
  }
}

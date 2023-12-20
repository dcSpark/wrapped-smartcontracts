import { MilkomedaConstants } from "./MilkomedaConstants";
import { MilkomedaNetwork } from "./MilkomedaNetwork";
import { MilkomedaNetworkName, PendingTx, PendingTxType } from "./WSCLibTypes";

export enum ActivityStatus {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
}

export interface Activity extends PendingTx {
  status: ActivityStatus;
  values: {
    amount: string;
    decimals: number;
    token: string;
  }[];
}

export class ActivityManager {
  static async getBridgeActivity(
    network: MilkomedaNetworkName,
    evmAddress: string
  ): Promise<Activity[]> {
    const bridgeRequests = await MilkomedaNetwork.fetchBridgeRequests(network);
    // TODO: sync with Rinor/ Grzegorz on a cache strategy for the API
    const userToL2 = bridgeRequests.filter(
      (request) => request.to.toLowerCase() === evmAddress.toLowerCase()
    );
    const userToL1 = bridgeRequests.filter(
      (request) => request.from.toLowerCase() === evmAddress.toLowerCase()
    );

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
      const txType = request.to === evmAddress ? PendingTxType.Wrap : PendingTxType.Unwrap;

      let values: { amount: string; decimals: number; token: string }[] = [];
      if (txType !== PendingTxType.Unwrap) {
        values = request.assets.map((asset) => {
          return {
            amount: asset.asset_value,
            decimals: asset.mainchain_decimals,
            token: asset.symbol !== null ? asset.symbol : "ADA",
          };
        });
      } else {
        values = request.assets.map((asset) => {
          return {
            amount: asset.asset_value,
            decimals: asset.sidechain_decimals,
            token: asset.symbol !== null ? asset.symbol : "ADA",
          };
        });
      }

      return {
        hash: request.transaction_id,
        timestamp: request.timestamp,
        explorer: MilkomedaConstants.getEVMExplorerUrl(network) + "/tx/" + request.transaction_id,
        type: txType,
        destinationAddress: request.to,
        status,
        values,
      };
    });

    return normalized;
  }

  static async getBridgeActivityV2(
    network: MilkomedaNetworkName,
    evmAddress: string
  ): Promise<Activity[]> {
    const bridgeRequests = await MilkomedaNetwork.fetchBridgeRequests(
      network,
      20,
      `&evm_address=${evmAddress}`
    );
    // leaving the rest as is, to make sure we return the same format to previous function
    const userToL2 = bridgeRequests.filter(
      (request) => request.to.toLowerCase() === evmAddress.toLowerCase()
    );
    const userToL1 = bridgeRequests.filter(
      (request) => request.from.toLowerCase() === evmAddress.toLowerCase()
    );

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
      const txType = request.to === evmAddress ? PendingTxType.Wrap : PendingTxType.Unwrap;

      let values: { amount: string; decimals: number; token: string }[] = [];
      if (txType !== PendingTxType.Unwrap) {
        values = request.assets.map((asset) => {
          return {
            amount: asset.asset_value,
            decimals: asset.mainchain_decimals,
            token: asset.symbol !== null ? asset.symbol : "ADA",
          };
        });
      } else {
        values = request.assets.map((asset) => {
          return {
            amount: asset.asset_value,
            decimals: asset.sidechain_decimals,
            token: asset.symbol !== null ? asset.symbol : "ADA",
          };
        });
      }

      return {
        hash: request.transaction_id,
        timestamp: request.timestamp,
        explorer: MilkomedaConstants.getEVMExplorerUrl(network) + "/tx/" + request.transaction_id,
        type: txType,
        destinationAddress: request.to,
        status,
        values,
      };
    });

    return normalized;
  }
}

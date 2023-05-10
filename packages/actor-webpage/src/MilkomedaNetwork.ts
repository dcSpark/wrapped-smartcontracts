import BigNumber from "bignumber.js";
import { MilkomedaConstants } from "./MilkomedaConstants";
import { AddressResponse, EVMTokenBalance, TransactionResponse } from "./WSCLib";

export interface BridgeRequest {
  transaction_id: string;
  mainchain_tx_id: string;
  from: string;
  to: string;
  block_number: number;
  timestamp: number;
  executed_timestamp: number;
  invalidated: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: any[];
}

export interface BridgeRequestsResponse {
  requests: BridgeRequest[];
  following_params: {
    next_wrap_id: number;
    next_unwrap_id: number;
  };
}

export class MilkomedaNetwork {
  //
  // Milkomeda Bridge
  //

  static async bridgeFetchMultiplePages(
    url: string,
    targetCount: number,
    currentPage = 0,
    currentResults: BridgeRequest[] = []
  ): Promise<BridgeRequest[]> {
    const response = await fetch(url);
    const data: BridgeRequestsResponse = await response.json();
    const results = currentResults.concat(data.requests);

    if (
      results.length < targetCount &&
      data.following_params.next_wrap_id &&
      data.following_params.next_unwrap_id
    ) {
      const nextPageUrl = `${url.split("?")[0]}?sort=Desc&wrap_id=${
        data.following_params.next_wrap_id
      }&unwrap_id=${data.following_params.next_unwrap_id}&count=50`;
      return this.bridgeFetchMultiplePages(nextPageUrl, targetCount, currentPage + 1, results);
    } else {
      return results.slice(0, targetCount);
    }
  }

  static async fetchBridgeRequests(network: string, totalItems = 100): Promise<BridgeRequest[]> {
    const url = MilkomedaConstants.getBridgeAPIUrl(network) + `/requests?sort=Desc&count=100`;
    const results = await MilkomedaNetwork.bridgeFetchMultiplePages(url, totalItems);
    return results;
  }

  //
  // Milkomeda Explorer
  //

  static async destination_getTokenBalances(
    network: string,
    address: string
  ): Promise<EVMTokenBalance[]> {
    const url =
      MilkomedaConstants.getEVMExplorerUrl(network) +
      `/api?module=account&action=tokenlist&address=${address}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.message === "OK") {
      return data.result;
    } else {
      throw new Error("Failed to fetch token balances");
    }
  }

  static async getL2TransactionList(
    network: string,
    address: string,
    page = 0,
    offset = 10
  ): Promise<TransactionResponse[]> {
    const url =
      MilkomedaConstants.getEVMExplorerUrl(network) +
      `/api?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.result.map((transaction: any) => ({
      hash: transaction.hash,
      timeStamp: transaction.timeStamp,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      txreceipt_status: transaction.txreceipt_status,
    }));
  }

  //
  // Blockfrost
  //
  static async fetchAddressInfo(url: string, blockfrostId: string): Promise<AddressResponse> {
    const response = await fetch(url, {
      headers: {
        project_id: blockfrostId,
      },
    });
    const addressInfo: AddressResponse = await response.json();

    return addressInfo;
  }

  static async getAdaBalance(
    blockfrostUrl: string,
    blockfrostId: string,
    address: string
  ): Promise<string> {
    const url = blockfrostUrl + "/addresses/" + address;
    const addressInfo = await MilkomedaNetwork.fetchAddressInfo(url, blockfrostId);

    const lovelaceAmount = addressInfo.amount.find((amount) => amount.unit === "lovelace");
    if (!lovelaceAmount) {
      throw new Error("Lovelace not found in address amounts");
    }

    const lovelaceQuantity = new BigNumber(lovelaceAmount.quantity);
    const adaQuantity = lovelaceQuantity.dividedBy(new BigNumber(10).pow(6)).toString();
    return adaQuantity;
  }

  static async origin_getTokenBalances(
    address: string,
    blockfrostUrl: string,
    blockfrostId: string
  ): Promise<AddressResponse> {
    const url = blockfrostUrl + "/addresses/" + address + "/extended";
    const addressInfo = await MilkomedaNetwork.fetchAddressInfo(url, blockfrostId);
    return addressInfo;
  }
}

import BigNumber from "bignumber.js";
import { MilkomedaConstants } from "./MilkomedaConstants";
import {
  AddressResponse,
  AlgoAccountInfo,
  AlgoAsset,
  EVMTokenBalance,
  MilkomedaNetworkName,
  TransactionResponse,
} from "./WSCLibTypes";
import { OriginAmount } from "./CardanoPendingManger";

export interface BridgeAsset {
  asset_id: string;
  token_contract: string;
  token_type: string;
  minimum_value: string;
  timestamp: number;
  sidechain_decimals: number;
  mainchain_decimals: number;
  symbol: string;
  cardano_policy: null | string;
  cardano_fingerprint: null | string;
  algo_asset_id: null | string;
  tvl: null | string;
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

// TODO: temporary fix til indexer is fixed
export interface BridgeUnwrapRequestsResponse {
  unwrapping_details: {
    request_id: string;
    block_number: number;
    block_id: string;
    from: string;
    to: string;
    transaction_id: string;
    block_timestamp: number;
    invalidated: boolean;
  };
  unwrapping_transaction: {
    request_id: string;
    mainchain_tx_id: string;
    raw_transaction: string;
    creator: string;
    block_number: number;
    block_id: string;
    confirmed_block_number: number;
    confirmed_block_id: string;
    confirmed_timestamp: number;
    executed_block_number: number;
    executed_block_id: number;
    executed_timestamp: number;
    transaction_id: string;
    block_timestamp: number;
  };
  unwrapping_votes: {
    id: string;
    request_id: string;
    voter: string;
    witness: string;
    block_number: number;
    block_id: string;
    transaction_id: string;
    timestamp: number;
  }[];
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

  static async searchMainchainTxInBridge(
    network: string,
    hash: string
  ): Promise<BridgeRequest | null> {
    const url =
      MilkomedaConstants.getBridgeAPIUrl(network) + `/requests?mainchain_tx_id=${hash}&count=75`;
    const response = await fetch(url);
    const data: BridgeRequestsResponse = await response.json();

    if (data.requests.length === 0) {
      return null;
    } else {
      return data.requests[0];
    }
  }

  static async searchMilkomedaTxInBridge(
    network: string,
    hash: string
  ): Promise<BridgeRequest | null> {
    const url = MilkomedaConstants.getBridgeAPIUrl(network) + `/requests?tx_id=${hash}&count=75`;
    const response = await fetch(url);
    const data: BridgeRequestsResponse = await response.json();

    if (data.requests.length === 0) {
      return null;
    } else {
      return data.requests[0];
    }
  }

  // TODO: temporary fix til indexer is fixed
  static async searchMilkomedaTxInBridgeTemporary(
    network: string,
    hash: string
  ): Promise<boolean> {
    const url = MilkomedaConstants.getBridgeAPIUrl(network) + `/unwrapping_requests?tx_id=${hash}`;
    const response = await fetch(url);
    const data: BridgeUnwrapRequestsResponse = await response.json();
    const atLeast3Voters = (data?.unwrapping_votes ?? []).length >= 3;
    const hasMainchainTxId = (data?.unwrapping_transaction?.mainchain_tx_id ?? "") !== "";
    return atLeast3Voters && hasMainchainTxId;
  }

  static async fetchBridgeAssets(network: string): Promise<BridgeAsset[]> {
    const url = MilkomedaConstants.getBridgeAPIUrl(network) + `/assets?active=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json: BridgeAsset[] = await response.json();

    function extractAndConvert(input: string): string {
      const last58 = input.slice(-58);
      return BigInt(last58).toString();
    }

    const updatedJson: BridgeAsset[] = json.map((asset) => {
      if (
        network === MilkomedaNetworkName.A1Mainnet ||
        network === MilkomedaNetworkName.A1Devnet
      ) {
        return { ...asset, algo_asset_id: extractAndConvert(asset.asset_id) };
      }
      return asset;
    });

    return updatedJson;
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
    } else if (data.message === "No tokens found") {
      return [];
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
  // Algod
  //
  static async getAlgoBalance(network: string, account: string): Promise<string> {
    const tokens = await MilkomedaNetwork.algo_getTokenBalances(network, account);
    const algoToken = tokens.find(
      (token) => token.unit === MilkomedaConstants.getNativeAssetId(network)
    );
    return algoToken?.quantity || "0";
  }

  static async algo_getTokenBalances(network: string, account: string): Promise<OriginAmount[]> {
    const url = MilkomedaConstants.getAlgorandExplorerUrl(network) + "/v2/accounts/" + account;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const accountInfo: AlgoAccountInfo = (await response.json()).account;
    // "amount": 12000000, "assets":[{"amount":12300000,"asset-id":12400859,"is-frozen":false}]

    const assetOriginAmounts: OriginAmount[] = accountInfo.assets.map(
      (asset: AlgoAsset): OriginAmount => ({
        unit: asset["asset-id"].toString(),
        quantity: asset.amount.toString(),
        decimals: asset["decimals"],
        bridgeAllowed: undefined,
        fingerprint: undefined,
        assetName: asset["unit-name"],
      })
    );

    const amountOriginAmount: OriginAmount = {
      unit: MilkomedaConstants.getNativeAssetId(network),
      quantity: (accountInfo.amount / 1e6).toString(),
      decimals: null,
      bridgeAllowed: true,
      fingerprint: undefined,
      assetName: "ALGO",
    };

    return [...assetOriginAmounts, amountOriginAmount];
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const addressInfo: AddressResponse = await response.json();
    return addressInfo;
  }

  static async getAdaBalance(
    blockfrostUrl: string,
    blockfrostId: string,
    address: string
  ): Promise<string> {
    try {
      const url = blockfrostUrl + "/addresses/" + address;
      const addressInfo = await MilkomedaNetwork.fetchAddressInfo(url, blockfrostId);

      const lovelaceAmount = addressInfo.amount.find((amount) => amount.unit === "lovelace");
      if (!lovelaceAmount) {
        throw new Error("Lovelace not found in address amounts");
      }

      const lovelaceQuantity = new BigNumber(lovelaceAmount.quantity);
      const adaQuantity = lovelaceQuantity.dividedBy(new BigNumber(10).pow(6)).toString();
      return adaQuantity;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return "0";
      }
      throw error;
    }
  }

  static async origin_getTokenBalances(
    address: string,
    blockfrostUrl: string,
    blockfrostId: string
  ): Promise<AddressResponse | null> {
    try {
      const url = blockfrostUrl + "/addresses/" + address + "/extended";
      const addressInfo = await MilkomedaNetwork.fetchAddressInfo(url, blockfrostId);
      return addressInfo;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }
}

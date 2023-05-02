// import type { MilkomedaProvider } from "provider";
import { ethers } from "ethers";
import { Blockfrost, Lucid, WalletApi } from "lucid-cardano";
import { milkomedaNetworks } from "@dcspark/milkomeda-js-sdk";

export interface TokenBalance {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
  type: string;
}

export interface TransactionResponse {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  txreceipt_status: string;
}

export enum MilkomedaNetwork {
  C1Mainnet = "Cardano C1 Mainnet",
  C1Devnet = "Cardano C1 Devnet",
  A1Mainnet = "Algorand A1 Mainnet",
  A1Devnet = "Algorand A1 Devnet",
}

export enum UserWallet {
  Flint = "Flint",
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

class WSCLib {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any; // TODO: fix types. does it require to update provider?
  oracleUrl: string;
  jsonRpcProviderUrl: string;
  network: MilkomedaNetwork;

  // Cardano
  wallet: UserWallet | undefined;
  blockfrost: any;
  lucid: any;

  constructor(
    network: MilkomedaNetwork,
    oracleUrl: string,
    jsonRpcProviderUrl: string,
    wallet: UserWallet
  ) {
    // TODO: OracleURL and jsonRpc should be optional bc they can be derived from network
    this.oracleUrl = oracleUrl;
    this.jsonRpcProviderUrl = jsonRpcProviderUrl;
    this.network = network;
    this.wallet = wallet;
  }

  isCardanoWallet(wallet: string): boolean {
    switch (wallet) {
      case UserWallet.Flint:
        return true;
      default:
        return false;
    }
  }

  getExplorerUrl(): string {
    switch (this.network) {
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

  getMilkomedaStargateUrl(): string {
    switch (this.network) {
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

  // TODO: this eventually should also work with Algorand
  // TODO: add the other wallets or make it generic
  async getWalletProvider(): Promise<WalletApi> {
    switch (this.wallet) {
      case UserWallet.Flint:
        return await window.cardano.flint.enable();
      default:
        throw new Error("Invalid wallet");
    }
  }

  async loadProvider(): Promise<void> {
    this.provider = await import("provider");
  }

  async loadLucid(): Promise<void> {
    // TODO: key must be part of the ENV
    // How can we hide this?
    const key = "";

    const cardanoNetwork = this.network === MilkomedaNetwork.C1Mainnet ? "Mainnet" : "Preprod";
    this.lucid = await Lucid.new(
      new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", key),
      cardanoNetwork
    );

    console.log("window.cardano: ", window.cardano);
    const walletProvider = await this.getWalletProvider();
    this.lucid.selectWallet(walletProvider);
  }

  async inject(): Promise<void> {
    if (!this.provider) {
      await this.loadProvider();
    }
    await this.provider.inject(this.oracleUrl, this.jsonRpcProviderUrl).setup();
    await this.eth_requestAccounts();

    // TODO: Add specific Cardano wallet?
    await this.loadLucid();

    // TODO: Make it work for Algorand
  }

  async eth_requestAccounts(): Promise<string> {
    const result = (await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[];
    return result[0];
  }

  async eth_getAccount(): Promise<string> {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return signer.getAddress();
  }

  async eth_getBalance(): Promise<string> {
    if (!this.provider) throw "Provider not loaded";

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const balance = await provider.getBalance(signer.getAddress());
    return ethers.utils.formatEther(balance);
  }

  async getEthersProvider(): Promise<ethers.providers.Web3Provider> {
    if (!window.ethereum) throw "Provider not loaded";
    return new ethers.providers.Web3Provider(window.ethereum);
  }

  public async getTransactionList(
    address: string | undefined = undefined,
    page = 0,
    offset = 10
  ): Promise<TransactionResponse[]> {
    const targetAddress = address || (await this.eth_getAccount());
    const url =
      this.getExplorerUrl() +
      `/api?module=account&action=txlist&address=${targetAddress}&page=${page}&offset=${offset}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.result.map((transaction: any) => ({
      hash: transaction.hash,
      timeStamp: transaction.timeStamp,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      txreceipt_status: transaction.txreceipt_status,
    }));
  }

  async getTokenBalances(address: string | undefined = undefined): Promise<TokenBalance[]> {
    const targetAddress = address || (await this.eth_getAccount());
    const url =
      this.getExplorerUrl() + `/api?module=account&action=tokenlist&address=${targetAddress}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.message === "OK") {
      return data.result;
    } else {
      throw new Error("Failed to fetch token balances");
    }
  }

  // Cardano specific
  async getCardanoBalance(address: string | undefined = undefined): Promise<string> {
    console.log("Cardano Balance");
    return "";
  }

  async origin_getBalance(): Promise<string> {
    if (!this.lucid) throw "Lucid not loaded";
    return await this.lucid.wallet.address();
  }

  async origin_getAddress(): Promise<string> {
    if (!this.lucid) throw "Lucid not loaded";
    return await this.lucid.wallet.address();
  }

  // Bridge
  async fetchFromStargate(url: string): Promise<StargateApiResponse> {
    try {
      const response = await fetch(url);
      const data: StargateApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data from URL:", error);
      throw error;
    }
  }

  // Pending Transactions
  async getPendingTransactions(): Promise<TransactionResponse[]> {
    // TODO: Check all the txs for the past 24 hrs to the bridge SC
    // TODO: Filter the ones sent by the user
    // TODO: Check the bridge API and make sure that they haven't been confirmed
    // TODO: Same but from the other end

    return [];
  }
}

export default WSCLib;

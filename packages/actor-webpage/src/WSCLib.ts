import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Blockfrost, Lucid, WalletApi } from "lucid-cardano";
import PendingManager from "./PendingManger";

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

export interface PendingTx {
  hash: string;
  timestamp: number;
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

export interface AddressAmount {
  unit: string;
  quantity: string;
}

export interface AddressResponse {
  address: string;
  amount: AddressAmount[];
  stake_address: string;
  type: string;
  script: boolean;
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
    // TODO: We should never make the Blockfrost key public
    // so we need to refactor and maybe add a proxy backend
    const key = "";

    const cardanoNetwork = this.network === MilkomedaNetwork.C1Mainnet ? "Mainnet" : "Preprod";
    this.blockfrost = new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", key);
    this.lucid = await Lucid.new(this.blockfrost, cardanoNetwork);

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
    PendingManager.getExplorerUrl(this.network) +
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
      PendingManager.getExplorerUrl(this.network) +
      `/api?module=account&action=tokenlist&address=${targetAddress}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.message === "OK") {
      return data.result;
    } else {
      throw new Error("Failed to fetch token balances");
    }
  }

  // Pending
  async getPendingTransactions(): Promise<PendingTx[]> {
    const userL1Address = await this.origin_getAddress();
    const evmAddress = await this.eth_getAccount();
    const pendingMngr = new PendingManager(this.blockfrost, this.network, userL1Address, evmAddress);
    const pendingTxs = await pendingMngr.getPendingTransactions();

    return pendingTxs;
  }

  // Cardano specific
  async fetchAddressInfo(url: string): Promise<AddressResponse> {
    console.log("fetchAddressInfo", url);
    const response = await fetch(url, {
      headers: {
        project_id: this.blockfrost.projectId,
      },
    });
    const addressInfo: AddressResponse = await response.json();

    return addressInfo;
  }

  async origin_getBalance(address: string | undefined = undefined): Promise<string> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) return "";
    const url = this.blockfrost.url + "/addresses/" + targetAddress;
    const addressInfo = await this.fetchAddressInfo(url);

    const lovelaceAmount = addressInfo.amount.find((amount) => amount.unit === "lovelace");
    if (!lovelaceAmount) {
      throw new Error("Lovelace not found in address amounts");
    }

    const lovelaceQuantity = new BigNumber(lovelaceAmount.quantity);
    const adaQuantity = lovelaceQuantity.dividedBy(new BigNumber(10).pow(6)).toString();

    return adaQuantity;
  }

  async origin_getAddress(): Promise<string> {
    if (!this.lucid) throw "Lucid not loaded";
    return await this.lucid.wallet.address();
  }
}

export default WSCLib;

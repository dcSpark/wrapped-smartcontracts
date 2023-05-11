import { ethers } from "ethers";
import { Blockfrost, Lucid, WalletApi } from "lucid-cardano";
import PendingManager, { CardanoAmount, StargateApiResponse } from "./PendingManger";
import { MilkomedaConstants } from "./MilkomedaConstants";
import {
  adaFingerprint,
  assetNameFromBlockfrostId,
  getFingerprintFromBlockfrost,
  getFingerprintFromBridge,
} from "./utils";
import BridgeActions from "./BridgeActions";
import { MilkomedaNetwork } from "./MilkomedaNetwork";
import { Activity, ActivityManager, ActivityStatus } from "./Activity";
import BigNumber from "bignumber.js";

export interface EVMTokenBalance {
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

export enum PendingTxType {
  Wrap = "Wrap",
  WrapPermission = "WrapPermission",
  Unwrap = "Unwrap",
  Normal = "Normal",
}

export interface PendingTx {
  hash: string;
  timestamp: number;
  explorer: string | undefined;
  type: PendingTxType;
  destinationAddress: string;
}

export enum MilkomedaNetworkName {
  C1Mainnet = "Cardano C1 Mainnet",
  C1Devnet = "Cardano C1 Devnet",
  A1Mainnet = "Algorand A1 Mainnet",
  A1Devnet = "Algorand A1 Devnet",
}

export enum UserWallet {
  Flint = "Flint",
}

export interface AddressResponse {
  address: string;
  amount: CardanoAmount[];
  stake_address: string;
  type: string;
  script: boolean;
}

class WSCLib {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wscProvider: any; // TODO: fix types. does it require to update provider?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evmProvider: any;
  oracleUrl: string;
  jsonRpcProviderUrl: string;
  network: MilkomedaNetworkName;

  // Cardano
  wallet: UserWallet | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockfrost: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lucid: any;

  constructor(
    network: MilkomedaNetworkName,
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
    this.wscProvider = await import("provider");
  }

  async loadLucid(): Promise<void> {
    // TODO: We should never make the Blockfrost key public
    // so we need to refactor and maybe add a proxy backend
    const key = "";

    const cardanoNetwork = this.network === MilkomedaNetworkName.C1Mainnet ? "Mainnet" : "Preprod";
    // TODO: get blockfrost url from network
    this.blockfrost = new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", key);
    this.lucid = await Lucid.new(this.blockfrost, cardanoNetwork);

    const walletProvider = await this.getWalletProvider();
    this.lucid.selectWallet(walletProvider);
  }

  async inject(): Promise<WSCLib> {
    if (!this.wscProvider) {
      await this.loadProvider();
    }
    await this.wscProvider.inject(this.oracleUrl, this.jsonRpcProviderUrl).setup();
    await this.eth_requestAccounts();

    // TODO: Add specific Cardano wallet?
    await this.loadLucid();

    this.evmProvider = await this.getEthersProvider();

    // TODO: Make it work for Algorand
    return this;
  }

  async eth_requestAccounts(): Promise<string> {
    const result = (await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[];
    return result[0];
  }

  async eth_getAccount(): Promise<string> {
    const signer = (await this.getEthersProvider()).getSigner();
    return signer.getAddress();
  }

  async eth_getBalance(): Promise<string> {
    if (!this.wscProvider) throw "Provider not loaded";

    const signer = (await this.getEthersProvider()).getSigner();
    const balance = await this.evmProvider.getBalance(signer.getAddress());
    return ethers.utils.formatEther(balance);
  }

  async getEthersProvider(): Promise<ethers.providers.Web3Provider> {
    if (!window.ethereum) throw "Provider not loaded";
    return new ethers.providers.Web3Provider(window.ethereum);
  }

  async getTokenBalances(address: string | undefined = undefined): Promise<EVMTokenBalance[]> {
    const targetAddress = address || (await this.eth_getAccount());
    return await MilkomedaNetwork.destination_getTokenBalances(this.network, targetAddress);
  }

  // Pending
  async getPendingTransactions(): Promise<PendingTx[]> {
    const userL1Address = await this.origin_getAddress();
    const evmAddress = await this.eth_getAccount();
    const pendingMngr = new PendingManager(
      this.blockfrost,
      this.network,
      userL1Address,
      evmAddress
    );
    const pendingTxs = await pendingMngr.getPendingTransactions();

    return pendingTxs;
  }

  // Cardano specific

  async origin_getADABalance(address: string | undefined = undefined): Promise<string> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) return "";
    return await MilkomedaNetwork.getAdaBalance(
      this.blockfrost.url,
      this.blockfrost.projectId,
      targetAddress
    );
  }

  async origin_getAddress(): Promise<string> {
    if (!this.lucid) throw "Lucid not loaded";
    return await this.lucid.wallet.address();
  }

  async origin_getTokenBalances(
    address: string | undefined = undefined
  ): Promise<CardanoAmount[]> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) throw new Error("Address not found");
    const addressInfo = await MilkomedaNetwork.origin_getTokenBalances(
      targetAddress,
      this.blockfrost.url,
      this.blockfrost.projectId
    );
    const updatedTokens = await this.updateAssetsWithBridgeInfo(addressInfo.amount);
    return updatedTokens;
  }

  async updateAssetsWithBridgeInfo(tokens: CardanoAmount[]): Promise<CardanoAmount[]> {
    const url = MilkomedaConstants.getMilkomedaStargateUrl(this.network);
    const response = await fetch(url);
    const stargateObj: StargateApiResponse = await response.json();
    const assets = stargateObj.assets;

    for (const asset of assets) {
      asset.fingerprint = await getFingerprintFromBridge(asset.idCardano);
    }

    for (const token of tokens) {
      if (token.unit === "lovelace") {
        token.bridgeAllowed = true;
        token.assetName = "ADA";
        token.fingerprint = await adaFingerprint();
        continue;
      }
      token.fingerprint = await getFingerprintFromBlockfrost(token.unit);
      token.assetName = await assetNameFromBlockfrostId(token.unit);
      token.bridgeAllowed = assets.some((asset) => token.fingerprint === asset.fingerprint);
    }

    return tokens;
  }

  // Bridge Actions
  async wrap(destination: string | undefined, assetId: string, amount: number): Promise<void> {
    const targetAddress = destination || (await this.eth_getAccount());
    const stargate = await PendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );
    const bridgeAddress = MilkomedaConstants.getBridgeEVMAddress(this.network);
    const bridgeActions = new BridgeActions(
      this.lucid,
      this.wscProvider,
      stargate,
      bridgeAddress,
      this.network
    );
    await bridgeActions.wrap(assetId, targetAddress, amount);
  }

  async unwrap(
    destination: string | undefined,
    assetId: string,
    amount: BigNumber
  ): Promise<void> {
    const targetAddress = destination || (await this.origin_getAddress());
    const stargate = await PendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );
    const bridgeAddress = MilkomedaConstants.getBridgeEVMAddress(this.network);
    const bridgeActions = new BridgeActions(
      this.lucid,
      this.evmProvider,
      stargate,
      bridgeAddress,
      this.network
    );
    // In order to maintain the unwrap function agnostic to send all, we need to
    // discount some fees from the total amount so it can be used for the transaction
    let amountToUnwrap = amount;
    if (assetId === MilkomedaConstants.AdaERC20Address(this.network)) {
      const Adafees = bridgeActions.stargateAdaFeeToCardano() + 0.05;
      amountToUnwrap = amount.dividedBy(10 ** 6).minus(new BigNumber(Adafees));
    }
    bridgeActions.unwrap(targetAddress, assetId, amountToUnwrap);
  }

  // Latest Activity
  // Show the latest activity of the user: L2 -> L2, L2 -> L1 and L1 -> L2.
  async latestActivity(): Promise<Activity[]> {
    const targetAddress = await this.eth_getAccount();
    const bridgeActivity = await ActivityManager.getBridgeActivity(this.network, targetAddress);
    const l2Activity = await this.getL2TransactionList();
    const l2normalized: Activity[] = l2Activity.map((transaction) => {
      return {
        hash: transaction.hash,
        timestamp: parseInt(transaction.timeStamp),
        explorer: MilkomedaConstants.getEVMExplorerUrl(this.network) + "/tx/" + transaction.hash,
        type: PendingTxType.Normal,
        destinationAddress: transaction.to,
        status: ActivityStatus.Completed,
        values: [],
      };
    });

    const grouped = [...bridgeActivity, ...l2normalized];
    // Remove duplicates based on hash and prioritize non-normal types
    const uniqueActivities = new Map<string, Activity>();
    grouped.forEach((activity) => {
      const existingActivity = uniqueActivities.get(activity.hash);

      if (
        !existingActivity ||
        (existingActivity.type === PendingTxType.Normal && activity.type !== PendingTxType.Normal)
      ) {
        uniqueActivities.set(activity.hash, activity);
      }
    });

    return Array.from(uniqueActivities.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }

  public async getL2TransactionList(
    address: string | undefined = undefined,
    page = 0,
    offset = 10
  ): Promise<TransactionResponse[]> {
    const targetAddress = address || (await this.eth_getAccount());
    return MilkomedaNetwork.getL2TransactionList(this.network, targetAddress, page, offset);
  }
}

export default WSCLib;

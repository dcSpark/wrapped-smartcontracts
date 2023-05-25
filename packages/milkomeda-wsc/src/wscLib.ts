import { ethers } from "ethers";
import { Blockfrost, Lucid, WalletApi } from "lucid-cardano";
import CardanoPendingManager, { CardanoAmount, StargateApiResponse } from "./CardanoPendingManger";
import { MilkomedaConstants } from "./MilkomedaConstants";
import type { MilkomedaProvider } from "milkomeda-wsc-provider";
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
import algosdk from "algosdk";
import {
  EVMTokenBalance,
  MilkomedaNetworkName,
  PendingTx,
  PendingTxType,
  TransactionResponse,
} from "./WSCLibTypes";

export class WSCLib {
  wscProvider!: MilkomedaProvider;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evmProvider: any;
  oracleUrl: string;
  jsonRpcProviderUrl: string;
  network: MilkomedaNetworkName;

  // Cardano
  wallet: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockfrost: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lucid: any;

  constructor(
    network: MilkomedaNetworkName,
    wallet: string,
    customSettings:
      | {
          oracleUrl: string | undefined;
          jsonRpcProviderUrl: string | undefined;
          blockfrostKey: string | undefined;
        }
      | undefined = undefined
  ) {
    this.oracleUrl =
      customSettings == null || customSettings.oracleUrl == null
        ? MilkomedaConstants.getOracle(network)
        : customSettings.oracleUrl;
    this.jsonRpcProviderUrl =
      customSettings == null || customSettings.jsonRpcProviderUrl == null
        ? MilkomedaConstants.getEVMRPC(network)
        : customSettings.jsonRpcProviderUrl;
    this.network = network;
    this.wallet = wallet;

    if (this.isCardano()) {
      if (customSettings == null || customSettings.blockfrostKey == null)
        throw new Error("Missing blockfrost key");
      this.blockfrost = new Blockfrost(
        MilkomedaConstants.blockfrost(this.network),
        customSettings.blockfrostKey
      );
    } else {
      throw new Error("Algorand not supported yet. Coming very soon!");
    }
  }

  isCardano(): boolean {
    switch (this.network) {
      case MilkomedaNetworkName.C1Devnet:
      case MilkomedaNetworkName.C1Mainnet:
        return true;
      default:
        return false;
    }
  }

  isAlgorand(): boolean {
    switch (this.network) {
      case MilkomedaNetworkName.A1Devnet:
      case MilkomedaNetworkName.A1Mainnet:
        return true;
      default:
        return false;
    }
  }

  async loadAlgod(): Promise<void> {
    // https://algonode.io/api/
    // https://developer.algorand.org/docs/reference/rest-apis/algod/v2/

    const token = "";
    const server = "https://testnet-api.algonode.cloud";
    const client = new algosdk.Algodv2(token, server);

    (async () => {
      console.log(await client.status().do());
    })().catch((e) => {
      console.log(e);
    });
  }

  // TODO: this eventually should also work with Algorand
  async getWalletProvider(): Promise<WalletApi> {
    if (this.isCardano() && this.wallet != null) {
      const walletApi = await window.cardano[this.wallet].enable();
      return walletApi;
    }
    throw new Error("Invalid wallet");
  }

  async loadLucid(): Promise<void> {
    const cardanoNetwork = this.network === MilkomedaNetworkName.C1Mainnet ? "Mainnet" : "Preprod";
    this.lucid = await Lucid.new(this.blockfrost, cardanoNetwork);

    const walletProvider = await this.getWalletProvider();
    this.lucid.selectWallet(walletProvider);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletName = this.wallet as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.cardano as any) = { ...walletProvider, ...window.cardano[walletName] };
  }

  async inject(): Promise<WSCLib> {
    let injector: typeof import("milkomeda-wsc-provider");
    if (!this.wscProvider) {
      injector = await import("milkomeda-wsc-provider");
    }

    if (this.isCardano()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.wscProvider = injector!.injectCardano(this.oracleUrl, this.jsonRpcProviderUrl);
    } else if (this.isAlgorand()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.wscProvider = injector!.injectAlgorand(this.oracleUrl, this.jsonRpcProviderUrl);
    } else {
      throw new Error("Invalid wallet");
    }
    await this.wscProvider.setup();

    if (this.isCardano()) {
      await this.loadLucid();
    } else {
      await this.loadAlgod();
    }

    this.evmProvider = await this.getEthersProvider();
    await this.eth_requestAccounts();
    return this;
  }

  async eth_requestAccounts(): Promise<string> {
    if (window.ethereum == null) throw new Error("Provider not loaded");
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
    const pendingMngr = new CardanoPendingManager(
      this.blockfrost,
      this.network,
      userL1Address,
      evmAddress
    );
    const pendingTxs = await pendingMngr.getPendingTransactions();

    return pendingTxs;
  }

  async origin_getNativeBalance(address: string | undefined = undefined): Promise<string> {
    if (this.isCardano()) {
      return await this.origin_getADABalance(address);
    } else {
      return await this.origin_getAlgoBalance(address);
    }
  }

  //
  // Algorand specific
  //
  async origin_getAlgoBalance(address: string | undefined = undefined): Promise<string> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) return "";
    const algoAccount = this.wscProvider.algorandAccounts[0];
    console.log("algoAccount", algoAccount);
    return "";
    // return await MilkomedaNetwork.getAlgoBalance(
    //   this.blockfrost.url,
    //   this.blockfrost.projectId,
    //   targetAddress
    // );
  }

  //
  // Cardano specific
  //
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
    if (this.isCardano()) {
      if (!this.lucid) throw "Lucid not loaded";
      return await this.lucid.wallet.address();
    } else {
      const algoAccount = this.wscProvider.algorandAccounts[0];
      return algoAccount;
    }
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

  //
  // Bridge Actions
  //
  async wrap(destination: string | undefined, assetId: string, amount: number): Promise<void> {
    const targetAddress = destination || (await this.eth_getAccount());
    const stargate = await CardanoPendingManager.fetchFromStargate(
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
    const stargate = await CardanoPendingManager.fetchFromStargate(
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
    // TODO: check this line
    if (assetId === MilkomedaConstants.getBridgeEVMAddress(this.network)) {
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

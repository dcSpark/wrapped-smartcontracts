import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Blockfrost, Lucid, WalletApi } from "lucid-cardano";
import type { MilkomedaProvider } from "milkomeda-wsc-provider";
import { Activity, ActivityManager, ActivityStatus } from "./Activity";
import { AlgoPendingManager } from "./AlgoPendingManager";
import BridgeActions from "./BridgeActions";
import CardanoPendingManager, {
  ADAStargateApiResponse,
  OriginAmount,
} from "./CardanoPendingManger";
import { GenericStargate } from "./GenericStargate";
import { MilkomedaConstants } from "./MilkomedaConstants";
import { MilkomedaNetwork } from "./MilkomedaNetwork";
import {
  EVMTokenBalance,
  MilkomedaNetworkName,
  PendingTx,
  PendingTxType,
  TransactionResponse,
  TxPendingStatus,
} from "./WSCLibTypes";
import {
  adaFingerprint,
  assetNameFromBlockfrostId,
  getFingerprintFromBlockfrost,
  getFingerprintFromBridge,
} from "./utils";

export class WSCLib {
  wscProvider!: MilkomedaProvider;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evmProvider: any;
  oracleUrl: string;
  jsonRpcProviderUrl: string;
  network: MilkomedaNetworkName;

  // Algorand
  peraWallet: PeraWalletConnect | undefined;
  // Cardano
  wallet: string | undefined;
  blockfrost: Blockfrost | undefined;
  lucid: Lucid | undefined;

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
      this.peraWallet = new PeraWalletConnect({
        chainId: MilkomedaNetworkName.A1Mainnet === this.network ? 416001 : 416002,
        // shouldShowSignTxnToast: false
      });
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
    const server = MilkomedaConstants.algoNode(this.network);
    const client = new algosdk.Algodv2(token, server);

    (async () => {
      console.log(await client.status().do());
    })().catch((e) => {
      console.log(e);
    });
  }

  async getWalletProvider(): Promise<WalletApi> {
    if (this.isCardano() && this.wallet != null) {
      const walletApi = await window.cardano[this.wallet].enable();
      return walletApi;
    } else if (this.isAlgorand()) {
      // nothing required
      return {} as WalletApi;
    } else {
      throw new Error("Invalid wallet");
    }
  }

  async loadLucid(): Promise<void> {
    const cardanoNetwork = this.network === MilkomedaNetworkName.C1Mainnet ? "Mainnet" : "Preprod";
    this.lucid = await Lucid.new(this.blockfrost, cardanoNetwork);

    const walletProvider = await this.getWalletProvider();
    this.lucid.selectWallet(walletProvider);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletName = this.wallet as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.cardano as any) = {
      ...window.cardano,
      ...walletProvider,
      ...window.cardano[walletName],
    };
  }

  async inject(actorVersion?: number): Promise<WSCLib> {
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
    await this.wscProvider.setup(actorVersion);

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
    if (this.wscProvider == null) throw new Error("Provider not loaded");
    const result = (await this.wscProvider.request({
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
    if (!this.wscProvider) throw "Provider not loaded";
    const provider = new ethers.providers.Web3Provider(this.wscProvider);
    if (this.isAlgorand()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (provider.provider as any).peraWallet.chainId = this.peraWallet?.chainId;
    }
    return provider;
  }

  async getTokenBalances(address: string | undefined = undefined): Promise<EVMTokenBalance[]> {
    const targetAddress = address || (await this.eth_getAccount());
    return await MilkomedaNetwork.destination_getTokenBalances(this.network, targetAddress);
  }

  // Pending
  async getPendingTransactions(): Promise<PendingTx[]> {
    if (this.isCardano()) {
      const userL1Address = await this.origin_getAddress();
      const evmAddress = await this.eth_getAccount();
      const pendingMngr = new CardanoPendingManager(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.blockfrost!,
        this.network,
        userL1Address,
        evmAddress
      );
      const pendingTxs = await pendingMngr.getPendingTransactions();

      return pendingTxs;
    } else {
      return [];
    }
  }

  async origin_getNativeBalance(address: string | undefined = undefined): Promise<string> {
    if (this.isCardano()) {
      return await this.origin_getADABalance(address);
    } else {
      return await this.origin_getAlgoBalance(address);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async stargateObject(): Promise<any> {
    let stargate: GenericStargate;
    if (this.isCardano()) {
      const resp = await CardanoPendingManager.fetchFromStargate(
        MilkomedaConstants.getMilkomedaStargateUrl(this.network)
      );
      stargate = new GenericStargate(resp);
    } else {
      const resp = await AlgoPendingManager.fetchFromStargate(
        MilkomedaConstants.getMilkomedaStargateUrl(this.network)
      );
      stargate = new GenericStargate(resp);
    }

    return {
      stargateMinNativeTokenFromL1: stargate.stargateMinNativeTokenFromL1(),
      fromNativeTokenInLoveLaceOrMicroAlgo: stargate.fromNativeTokenInLoveLaceOrMicroAlgo(),
      stargateNativeTokenFeeToL1: stargate.stargateNativeTokenFeeToL1(),
      stargateMinNativeTokenToL1: stargate.stargateMinNativeTokenToL1(),
    };
  }

  //
  // Algorand specific
  //
  async origin_getAlgoBalance(address: string | undefined = undefined): Promise<string> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) return "";
    return await MilkomedaNetwork.getAlgoBalance(this.network, targetAddress);
  }

  //
  // Cardano specific
  //
  async origin_getADABalance(address: string | undefined = undefined): Promise<string> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) return "";
    return await MilkomedaNetwork.getAdaBalance(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.blockfrost!.url,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.blockfrost!.projectId,
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

  async origin_getTokenBalances(address: string | undefined = undefined): Promise<OriginAmount[]> {
    if (this.isCardano()) {
      return await this.cardano_origin_getTokenBalances(address);
    } else {
      return await this.algorand_origin_getTokenBalances(address);
    }
  }

  async cardano_origin_getTokenBalances(
    address: string | undefined = undefined
  ): Promise<OriginAmount[]> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) throw new Error("Address not found");
    const addressInfo = await MilkomedaNetwork.origin_getTokenBalances(
      targetAddress,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.blockfrost!.url,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.blockfrost!.projectId
    );
    if (addressInfo == null) return [];
    const updatedTokens = await this.ada_updateAssetsWithBridgeInfo(addressInfo.amount);
    return updatedTokens;
  }

  async algorand_origin_getTokenBalances(
    address: string | undefined = undefined
  ): Promise<OriginAmount[]> {
    const targetAddress = address || (await this.origin_getAddress());
    if (targetAddress == null) throw new Error("Address not found");
    const balances = await MilkomedaNetwork.algo_getTokenBalances(this.network, targetAddress);
    if (balances == null) return [];
    const updatedTokens = await this.algo_updateAssetsWithBridgeInfo(balances);
    return updatedTokens;
  }

  async algo_updateAssetsWithBridgeInfo(tokens: OriginAmount[]): Promise<OriginAmount[]> {
    const assets = await MilkomedaNetwork.fetchBridgeAssets(this.network);
    console.log("Bridge assets: ", assets);

    const stargate = await AlgoPendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );
    console.log("Stargate: ", stargate);

    for (const token of tokens) {
      if (token.unit === MilkomedaConstants.getNativeAssetId(this.network)) {
        token.bridgeAllowed = true;
        token.assetName = "ALGO";
        continue;
      }
      if (token.assetName == null) {
        token.assetName = assets.find((asset) => token.unit === asset.algo_asset_id)?.symbol;
      }
      if (token.decimals == null) {
        token.decimals =
          stargate.assets.find((asset) => token.unit === asset.algorandAssetId)
            ?.algorandDecimals || null;
      }
      token.bridgeAllowed = assets.some((asset) => token.unit === asset.algo_asset_id);
    }

    return tokens;
  }

  async ada_updateAssetsWithBridgeInfo(tokens: OriginAmount[]): Promise<OriginAmount[]> {
    const url = MilkomedaConstants.getMilkomedaStargateUrl(this.network);
    const response = await fetch(url);
    const stargateObj: ADAStargateApiResponse = await response.json();
    const assets = stargateObj.assets;

    const userL1Address = await this.origin_getAddress();
    const evmAddress = await this.eth_getAccount();
    const pendingMngr = new CardanoPendingManager(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.blockfrost!,
      this.network,
      userL1Address,
      evmAddress
    );

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
      token.decimals =
        (await pendingMngr.fetchCardanoAssetDetails(token.unit)).metadata?.decimals ?? 0;
    }

    return tokens;
  }

  //
  // Bridge Actions
  //
  async areTokensAllowed(assetIds: string[]): Promise<{ [key: string]: boolean }> {
    if (this.isCardano()) {
      return await this.cardano_areTokensAllowed(assetIds);
    } else {
      return await this.algorand_areTokensAllowed(assetIds);
    }
  }

  async constructAllowedTokensMap(
    normalizedAssetIds: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isAssetAllowed: (asset: any) => boolean
  ) {
    const resultMap: { [key: string]: boolean } = {};
    for (const assetId of normalizedAssetIds) {
      resultMap[assetId] = isAssetAllowed(assetId);
    }
    return resultMap;
  }

  async cardano_areTokensAllowed(assetIds: string[]): Promise<{ [key: string]: boolean }> {
    const url = MilkomedaConstants.getMilkomedaStargateUrl(this.network);
    const response = await fetch(url);
    const stargateObj: ADAStargateApiResponse = await response.json();

    const normalizedAssetIds = assetIds.map((assetId) => assetId.toLowerCase());

    return await this.constructAllowedTokensMap(normalizedAssetIds, (assetId) => {
      return stargateObj.assets.some((asset) => {
        return (
          asset.fingerprint?.toLowerCase() === assetId ||
          ("0x" + asset.idMilkomeda).toLowerCase() === assetId
        );
      });
    });
  }

  async algorand_areTokensAllowed(assetIds: string[]): Promise<{ [key: string]: boolean }> {
    const bridgeAllowedAssets = await MilkomedaNetwork.fetchBridgeAssets(this.network);

    const normalizedAssetIds = assetIds.map((assetId) => assetId.toLowerCase());

    return await this.constructAllowedTokensMap(normalizedAssetIds, (assetId) => {
      return bridgeAllowedAssets.some((asset) => {
        return asset.token_contract.toLowerCase() === assetId;
      });
    });
  }

  async wrap(
    destination: string | undefined,
    assetId: string,
    amount: number,
    feeOverrideAmount = 0
  ): Promise<string> {
    if (this.isCardano()) {
      return await this.ada_wrap(destination, assetId, amount, feeOverrideAmount);
    } else {
      return await this.algo_wrap(destination, assetId, amount);
    }
  }

  async ada_wrap(
    destination: string | undefined,
    assetId: string,
    amount: number,
    feeOverrideAmount = 0
  ): Promise<string> {
    const targetAddress = destination || (await this.eth_getAccount());
    const stargate = await CardanoPendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );
    const bridgeAddress = MilkomedaConstants.getBridgeEVMAddress(this.network);
    const bridgeActions = new BridgeActions(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.lucid,
      this.peraWallet,
      this.wscProvider,
      stargate,
      bridgeAddress,
      this.network
    );
    return await bridgeActions.wrap(assetId, targetAddress, amount, feeOverrideAmount);
  }

  async algo_wrap(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destination: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assetId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    amount: number
  ): Promise<string> {
    const targetAddress = destination || (await this.eth_getAccount());
    const stargate = await AlgoPendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );
    const bridgeAddress = MilkomedaConstants.getBridgeEVMAddress(this.network);
    const bridgeActions = new BridgeActions(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.lucid,
      this.peraWallet,
      this.wscProvider,
      stargate,
      bridgeAddress,
      this.network
    );
    return await bridgeActions.wrap(assetId, targetAddress, amount);
  }

  async unwrap(
    destination: string | undefined,
    assetId: string,
    amount: BigNumber
  ): Promise<string> {
    console.log("unwrap", destination, assetId, amount);
    const targetAddress = destination || (await this.origin_getAddress());
    const stargate = await CardanoPendingManager.fetchFromStargate(
      MilkomedaConstants.getMilkomedaStargateUrl(this.network)
    );
    const bridgeAddress = MilkomedaConstants.getBridgeEVMAddress(this.network);
    const bridgeActions = new BridgeActions(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.lucid,
      this.peraWallet,
      this.evmProvider,
      stargate,
      bridgeAddress,
      this.network
    );
    // In order to maintain the unwrap function agnostic to send all, we need to
    // discount some fees from the total amount so it can be used for the transaction
    let amountToUnwrap = amount;
    if (assetId == null) {
      const gasFees = this.isCardano() ? 0.05 : 0.5;
      const AdaFees = bridgeActions.stargateGeneric.stargateNativeTokenFeeToL1() + gasFees;
      amountToUnwrap = amount.dividedBy(10 ** 6).minus(new BigNumber(AdaFees));
    }
    return bridgeActions.unwrap(targetAddress, assetId, amountToUnwrap);
  }

  // TODO: Implement cache
  async getTxStatus(txHash: string): Promise<TxPendingStatus> {
    if (this.isCardano()) {
      const userL1Address = await this.origin_getAddress();
      const evmAddress = await this.eth_getAccount();

      const pendingMngr = new CardanoPendingManager(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.blockfrost!,
        this.network,
        userL1Address,
        evmAddress
      );

      // If the tx originated from Cardano
      if (!txHash.includes("0x")) {
        const cardanoMempoolTxs = await pendingMngr.getCardanoMempoolTxsToBridge();
        if (cardanoMempoolTxs.some((tx) => tx.hash === txHash)) {
          return TxPendingStatus.WaitingL1Confirmation;
        }

        const cardanoPendingTxs = await pendingMngr.getCardanoPendingTxs();
        if (cardanoPendingTxs.some((tx) => tx.hash === txHash)) {
          return TxPendingStatus.WaitingBridgeConfirmation;
        }

        const isConfirmed = await pendingMngr.isMainchainTxBridgeConfirmed(txHash);
        if (isConfirmed) {
          return TxPendingStatus.Confirmed;
        }

        throw new Error("Not found");
        // If the tx originated from Milkomeda
      } else if (txHash.includes("0x")) {
        const cardanoMempoolTxs = await pendingMngr.getCardanoMempoolTxsFromBridge();
        if (cardanoMempoolTxs.some((tx) => tx.hash === txHash)) {
          return TxPendingStatus.WaitingL1Confirmation;
        }

        const evmPending = await pendingMngr.getEVMPendingTxs();
        if (evmPending.some((tx) => tx.hash === txHash)) {
          return TxPendingStatus.WaitingBridgeConfirmation;
        }

        const isConfirmed = await pendingMngr.isMilkomedaTxBridgeConfirmed(txHash);
        if (isConfirmed) {
          return TxPendingStatus.Confirmed;
        }
        throw new Error("Not found");
      } else {
        throw new Error("Invalid address / Not found");
      }
    } else if (this.isAlgorand()) {
      // TODO: Add Algorand support
      throw new Error("Algorand support not implemented yet.");
    } else {
      throw new Error("Not Cardano neither Algorand. Error.");
    }
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

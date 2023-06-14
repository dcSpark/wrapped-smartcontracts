import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { default as bridgeArtifact } from "./contracts/bridge_abi_v1.json";
import { bech32ToHexAddress } from "./utils";
import { ADAStargateApiResponse, AlgoStargateApiResponse } from "./CardanoPendingManger";
import { MilkomedaConstants } from "./MilkomedaConstants";
import { Lucid } from "lucid-cardano";
import { MilkomedaProvider } from "milkomeda-wsc-provider";
import { MilkomedaNetworkName } from "./WSCLibTypes";
import { GenericStargate } from "./GenericStargate";

class BridgeActions {
  lucid: Lucid;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  stargateGeneric: GenericStargate;
  bridgeAddress: string;
  network: string;

  constructor(
    lucid: Lucid,
    provider: MilkomedaProvider,
    stargateApiResponse: ADAStargateApiResponse | AlgoStargateApiResponse,
    bridgeAddress: string,
    network: string
  ) {
    this.provider = provider;
    this.lucid = lucid;
    this.stargateGeneric = new GenericStargate(stargateApiResponse);
    this.bridgeAddress = bridgeAddress;
    this.network = network;
  }

  getBridgeMetadata(): string {
    switch (this.network) {
      case MilkomedaNetworkName.C1Mainnet:
        throw new Error("Need to add Bridge API URL for C1 Mainnet");
      case MilkomedaNetworkName.C1Devnet:
        return "devnet.cardano-evm.c1";
      case MilkomedaNetworkName.A1Mainnet:
        throw new Error("Need to add Bridge API URL for A1 Mainnet");
      case MilkomedaNetworkName.A1Devnet:
        throw new Error("Need to add Bridge API URL for A1 Devnet");
      default:
        throw new Error("Invalid network");
    }
  }

  wrap = async (tokenId: string, destination: string, amount: number): Promise<string> => {
    let payload = {};
    const stargateMin = this.stargateGeneric.stargateMinNativeTokenFromL1();
    if (tokenId === "lovelace") {
      if (amount < stargateMin) throw new Error("Amount is less than the minimum required");
      const amountLovelace = BigInt(amount) * BigInt(10 ** 6);
      const amountWithFees = amountLovelace + BigInt(this.stargateGeneric.fromNativeTokenInLoveLaceOrMicroAlgo());
      payload = { lovelace: amountWithFees };
    } else {
      payload = {
        lovelace: BigInt(this.stargateGeneric.nativeTokenToLovelaceOrMicroAlgo(stargateMin)),
        [tokenId]: BigInt(amount),
      };
    }

    const tx = await this.lucid
      .newTx()
      .payToAddress(this.stargateGeneric.stargateResponse.current_address, payload)
      .attachMetadata(87, this.getBridgeMetadata())
      .attachMetadata(88, destination)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    console.log(txHash);
    return txHash;
  };

  unwrap = async (
    destinationAddress: string,
    erc20address: string,
    amountToUnwrap: BigNumber
  ): Promise<string> => {
    console.log("ERC20 address: ", erc20address); 
    const contractAddress = erc20address || MilkomedaConstants.getBridgeEVMAddress(this.network);
    const tokenContract = new ethers.Contract(
      contractAddress, // token id e.g. "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F"
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      this.provider
    );
    const bridgeContract = new ethers.Contract(
      this.bridgeAddress,
      bridgeArtifact.abi,
      this.provider
    );
    const signer = this.provider.getSigner();
    const cardanoDestination = bech32ToHexAddress(destinationAddress);

    if (erc20address == null) {
      const minRequired = new BigNumber(this.stargateGeneric.stargateMinNativeTokenToL1());
      if (amountToUnwrap.lt(minRequired))
        // TODO: add info about the minimum required in ADA and token
        throw new Error("Amount is less than the minimum required");

      const amount = ethers.utils.parseUnits(amountToUnwrap.toString(), 18);
      const adaFee = new BigNumber(this.stargateGeneric.stargateNativeTokenFeeToL1());
      const adaAmount = amountToUnwrap.plus(adaFee);
      const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
        {
          assetId: ethers.constants.HashZero,
          from: await signer.getAddress(),
          to: cardanoDestination,
          amount: amount.toString(),
        },
        { gasLimit: 1_000_000, value: ethers.utils.parseUnits(adaAmount.toString(), 18) }
      );

      console.log("Unwrapping ADA");
      console.log(tx.hash);
      await tx.wait();
      return tx.hash;
    } else {
      const assetId = await bridgeContract.findAssetIdByAddress(erc20address);
      console.log("assetId: ", assetId);
      const approvalTx = await tokenContract
        .connect(signer)
        .approve(this.bridgeAddress, amountToUnwrap.toFixed(0), { gasLimit: 1_000_000 });

      await approvalTx.wait();
      console.log(approvalTx.hash);
      const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
        {
          assetId: assetId,
          from: await signer.getAddress(),
          to: cardanoDestination,
          amount: amountToUnwrap.toFixed(0),
        },
        {
          gasLimit: 1_000_000,
          value: ethers.utils.parseEther(this.stargateGeneric.stargateMinNativeTokenToL1().toString()),
        }
      );

      console.log("Unwrapping Asset");
      console.log(tx.hash);
      await tx.wait();
      return tx.hash;
    }
  };
}

export default BridgeActions;

import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { MilkomedaNetworkName } from "./WSCLib";
import { default as bridgeArtifact } from "./contracts/bridge_abi_v1.json";
import { bech32ToHexAddress } from "./utils";
import { StargateApiResponse } from "./PendingManger";
import { MilkomedaConstants } from "./MilkomedaConstants";

class BridgeActions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lucid: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  stargateResponse: StargateApiResponse;
  bridgeAddress: string;
  network: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lucid: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: any,
    stargateApiResponse: StargateApiResponse,
    bridgeAddress: string,
    network: string
  ) {
    this.provider = provider;
    this.lucid = lucid;
    this.stargateResponse = stargateApiResponse;
    this.bridgeAddress = bridgeAddress;
    this.network = network;
  }

  stargateMinAdaFromCardano(): number {
    return (
      parseInt(this.stargateResponse.ada.fromADAFeeLovelace) +
      parseInt(this.stargateResponse.ada.minLovelace)
    );
  }

  stargateMinAdaToCardano(): number {
    const toAdaFee = this.stargateAdaFeeToCardano();
    const minAda = parseInt(this.stargateResponse.ada.minLovelace) / 10**6;
    return (
       toAdaFee + minAda
    );
  }

  stargateAdaFeeToCardano(): number {
    const toAda = ethers.utils.parseUnits(this.stargateResponse.ada.toADAFeeGWei, 9).div(10**9).div(10**9);
    return (
       toAda.toNumber()
    );
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

  wrap = async (tokenId: string, destination: string, amount: number) => {
    // console.log("tokenId: ", tokenId);
    // console.log("destination: ", destination);
    // console.log("amount: ", amount);

    let payload = {};
    const stargateMin = this.stargateMinAdaFromCardano();
    console.log("stargateMin: ", stargateMin);
    if (tokenId === "lovelace") {
      if (amount < stargateMin) throw new Error("Amount is less than the minimum required");
      const amountLovelace = BigInt(amount) * BigInt(10 ** 6);
      const amountWithFees = amountLovelace + BigInt(this.stargateResponse.ada.fromADAFeeLovelace);
      payload = { lovelace: amountWithFees };
    } else {
      payload = {
        lovelace: BigInt(stargateMin),
        [tokenId]: BigInt(amount),
      };
    }

    const tx = await this.lucid
      .newTx()
      .payToAddress(this.stargateResponse.current_address, payload)
      .attachMetadata(87, this.getBridgeMetadata())
      .attachMetadata(88, destination)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    console.log(txHash);
  };

  unwrap = async (destinationAddress: string, erc20address: string, amountToUnwrap: BigNumber) => {
    console.log("ERC20 address: ", erc20address);
    const tokenContract = new ethers.Contract(
      erc20address, // token id e.g. "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F"
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

    if (erc20address === MilkomedaConstants.AdaERC20Address(this.network)) {
      const minRequired = new BigNumber(this.stargateMinAdaToCardano());
      if (amountToUnwrap.lt(minRequired))
        throw new Error("Amount is less than the minimum required");

      const amount = ethers.utils.parseUnits(amountToUnwrap.toString(), 6);
      const adaFee = new BigNumber((this.stargateAdaFeeToCardano()) * 10**6);
      const adaAmount = amountToUnwrap.plus(adaFee);
      const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
        {
          assetId: ethers.constants.HashZero,
          from: await signer.getAddress(),
          to: cardanoDestination,
          amount: amount.toString(),
        },
        { gasLimit: 1_000_000, value: ethers.utils.parseUnits(adaAmount.toString(), 6)}
      );

      console.log(tx.hash);
      await tx.wait();
      console.log("Unwrapped ADA");
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
        { gasLimit: 1_000_000, value: ethers.utils.parseEther(this.stargateMinAdaToCardano().toString()) }
      );

      console.log(tx.hash);
      await tx.wait();
      console.log("Unwrapped");
    }
  };
}

export default BridgeActions;

import { ethers } from "ethers";
import { default as bridgeArtifact } from "./contracts/bridge_abi_v1.json";
import { bech32ToHexAddress } from "./utils";
import { MilkomedaNetworkName } from "./WSCLib";
import BigNumber from "bignumber.js";

class BridgeActions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lucid: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  stargateAddress: string;
  bridgeAddress: string;
  network: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lucid: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: any,
    stargateAddress: string,
    bridgeAddress: string,
    network: string
  ) {
    this.provider = provider;
    this.lucid = lucid;
    this.stargateAddress = stargateAddress;
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

  wrap = async (tokenId: string, destination: string, amount: number) => {
    console.log("tokenId: ", tokenId);
    console.log("destination: ", destination);
    console.log("amount: ", amount);

    // TODO: get the bridge fee from the contract
    let payload = {};
    if (tokenId === "lovelace") {
      payload = { lovelace: BigInt(amount) * BigInt(10 ** 6) };
    } else {
      payload = {
        lovelace: BigInt(4) * BigInt(10 ** 6), // 3 (min) + 1 (fee)
        [tokenId]: BigInt(amount),
      };
    }

    const tx = await this.lucid
      .newTx()
      .payToAddress(this.stargateAddress, payload)
      .attachMetadata(87, this.getBridgeMetadata())
      .attachMetadata(88, destination)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    console.log(txHash);
  };

  unwrap = async (destinationAddress: string, assetId: string, amountToUnwrap: BigNumber) => {
    console.log("assetId: ", assetId);
    const tokenContract = new ethers.Contract(
      assetId, // token id e.g. "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F"
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      this.provider
    );
    const bridgeContract = new ethers.Contract(
      this.bridgeAddress,
      bridgeArtifact.abi,
      this.provider
    );
    const signer = this.provider.getSigner();

    const amount = ethers.utils.parseUnits(amountToUnwrap.toString(), 6);

    // TODO: is this required?
    // const amountToUnwrap = ethers.utils.parseUnits(, 6);
    console.log("Amount: ", amountToUnwrap.toFixed(0));

    const approvalTx = await tokenContract
      .connect(signer)
      .approve(this.bridgeAddress, amountToUnwrap.toFixed(0), { gasLimit: 1_000_000 });

    await approvalTx.wait();
    console.log(approvalTx.hash);

    const cardanoDestination = bech32ToHexAddress(destinationAddress);
    const shiftedAssetId = assetId + "000000000000000000000000";

    // TODO: get this from cpnstasnts this is mADA or add a new function
    if (assetId === "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648") {
      const adaAmount = amountToUnwrap.plus(4_000_000);
      const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
        {
          assetId: shiftedAssetId,
          from: await signer.getAddress(),
          to: cardanoDestination,
          amount: amount.toString(),
        },
        { gasLimit: 1_000_000, value: adaAmount.toFixed(0) }
      );

      console.log(tx.hash);
      await tx.wait();
      console.log("Unwrapped ADA");
    } else {
      const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
        {
          assetId: shiftedAssetId,
          from: await signer.getAddress(),
          to: cardanoDestination,
          amount: amount.toString(),
        },
        { gasLimit: 1_000_000, value: ethers.utils.parseEther("4") } // TODO: Update this
      );

      console.log(tx.hash);
      await tx.wait();
      console.log("Unwrapped");
    }
  };
}

export default BridgeActions;

import { ethers } from "ethers";
import { default as bridgeArtifact } from "./contracts/bridge_abi_v1.json";
import { bech32ToHexAddress, hexToBytes } from "./utils";
import { MilkomedaNetwork } from "./WSCLib";
import PendingManager from "./PendingManger";
let cml: typeof import("@dcspark/cardano-multiplatform-lib-browser");

class BridgeActions {
  lucid: any;
  provider: any;
  startgateAddress: string;
  bridgeAddress: string;
  network: string;

  constructor(
    lucid: any,
    provider: any,
    stargateAddress: string,
    bridgeAddress: string,
    network: string
  ) {
    this.provider = provider;
    this.lucid = lucid;
    this.startgateAddress = stargateAddress;
    this.bridgeAddress = bridgeAddress;
    this.network = network;
  }

  getBridgeMetadata(): string {
    switch (this.network) {
      case MilkomedaNetwork.C1Mainnet:
        throw new Error("Need to add Bridge API URL for C1 Mainnet");
      case MilkomedaNetwork.C1Devnet:
        return "devnet.cardano-evm.c1";
      case MilkomedaNetwork.A1Mainnet:
        throw new Error("Need to add Bridge API URL for A1 Mainnet");
      case MilkomedaNetwork.A1Devnet:
        throw new Error("Need to add Bridge API URL for A1 Devnet");
      default:
        throw new Error("Invalid network");
    }
  }

  wrap = async (destination: string, amount: number) => {
    const tx = await this.lucid
      .newTx()
      .payToAddress(this.startgateAddress, { lovelace: BigInt(amount) * BigInt(10 ** 6) })
      .attachMetadata(87, this.getBridgeMetadata())
      .attachMetadata(88, destination)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    console.log(txHash);
  };

  unwrap = async (destinationAddress: string, assetId: string, amountToUnwrap: number) => {
    
    const tokenContract = new ethers.Contract(
      "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F", // this.bridgeAddress?
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      this.provider
    );
    const bridgeContract = new ethers.Contract(this.bridgeAddress, bridgeArtifact.abi, this.provider);
    const signer = this.provider.getSigner();

    // const amountToUnwrap = ethers.utils.parseUnits(, 6);

    const approvalTx = await tokenContract
      .connect(signer)
      .approve(this.bridgeAddress, amountToUnwrap, { gasLimit: 1_000_000 });

    console.log(approvalTx.hash);

    await approvalTx.wait();

    const cardanoDestination = bech32ToHexAddress(
        destinationAddress,
    );

    const shiftedAssetId = assetId + "000000000000000000000000";

    const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
      {
        assetId: shiftedAssetId, // "0x1a19f891ca4d508c7f86ec03c598b7d11c2f1cc6000000000000000000000000",
        from: await signer.getAddress(),
        to: cardanoDestination,
        amount: amountToUnwrap,
      },
      { gasLimit: 1_000_000, value: ethers.utils.parseEther("4") }
    );

    console.log(tx.hash);
    await tx.wait();
    console.log("Unwrapped");
  };
}

export default BridgeActions;
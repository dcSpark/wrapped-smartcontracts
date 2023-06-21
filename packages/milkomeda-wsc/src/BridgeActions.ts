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
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";
import { hexlify, toUtf8Bytes } from "ethers/lib/utils";

/// PREFIX description (milkomeda/a1:u)
/// milkomeda/a1 - prefix
/// u - means unicode string data
const NOTE_PREFIX = "milkomeda/a1:u";
const prepareNoteForEncoding = (note: string): string => `${NOTE_PREFIX}${note}`;

class BridgeActions {
  lucid: Lucid | undefined;
  pera: PeraWalletConnect | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  stargateGeneric: GenericStargate;
  bridgeAddress: string;
  network: string;

  constructor(
    lucid: Lucid | undefined,
    pera: PeraWalletConnect | undefined,
    provider: MilkomedaProvider,
    stargateApiResponse: ADAStargateApiResponse | AlgoStargateApiResponse,
    bridgeAddress: string,
    network: string
  ) {
    this.provider = provider;
    this.lucid = lucid;
    this.pera = pera;
    this.stargateGeneric = new GenericStargate(stargateApiResponse);
    this.bridgeAddress = bridgeAddress;
    this.network = network;
  }

  isCardano(): boolean {
    return (
      this.network === MilkomedaNetworkName.C1Mainnet ||
      this.network === MilkomedaNetworkName.C1Devnet
    );
  }

  getBridgeMetadata(): string {
    switch (this.network) {
      case MilkomedaNetworkName.C1Mainnet:
        return "mainnet.cardano-evm.c1";
      case MilkomedaNetworkName.C1Devnet:
        return "devnet.cardano-evm.c1";
      case MilkomedaNetworkName.A1Mainnet:
        return "milkomeda/a1";
      case MilkomedaNetworkName.A1Devnet:
        return "milkomeda/a1";
      default:
        throw new Error("Invalid network");
    }
  }

  wrap = async (tokenId: string, destination: string, amount: number): Promise<string> => {
    if (
      this.network === MilkomedaNetworkName.C1Mainnet ||
      this.network === MilkomedaNetworkName.C1Devnet
    ) {
      if (!this.lucid) throw new Error("Lucid is not initialized");

      let payload = {};
      const stargateMin = this.stargateGeneric.stargateMinNativeTokenFromL1();
      if (tokenId === "lovelace") {
        if (amount < stargateMin) throw new Error("Amount is less than the minimum required");
        const amountLovelace = BigInt(amount) * BigInt(10 ** 6);
        const amountWithFees =
          amountLovelace + BigInt(this.stargateGeneric.fromNativeTokenInLoveLaceOrMicroAlgo());
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
    } else {
      if (!this.pera) throw new Error("Pera is not initialized");

      const stargateMin = this.stargateGeneric.fromNativeTokenInLoveLaceOrMicroAlgo();
      const algod = new algosdk.Algodv2("", MilkomedaConstants.algoNode(this.network));
      const params = await algod.getTransactionParams().do();
      const originAccount = this.provider.algorandAccounts[0];

      let unsignedTx: algosdk.Transaction | null = null;
      if (tokenId === MilkomedaConstants.getNativeAssetId(this.network)) {
        const amountMicroAlgo = BigInt(amount) * BigInt(10 ** 6);
        const amountPlusFees = new BigNumber(amountMicroAlgo.toString())
          .plus(new BigNumber(stargateMin))
          .toString();
        unsignedTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          suggestedParams: {
            ...params,
          },
          from: originAccount,
          to: this.stargateGeneric.stargateResponse.current_address,
          amount: parseInt(amountPlusFees),
          note: this.encodeNote(prepareNoteForEncoding(destination)),
        });
      } else {
        unsignedTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          suggestedParams: {
            ...params,
          },
          from: originAccount,
          to: this.stargateGeneric.stargateResponse.current_address,
          amount,
          note: this.encodeNote(prepareNoteForEncoding(destination)),
          assetIndex: Number(tokenId),
        });
      }

      if (!unsignedTx) throw new Error("Unsigned transaction is null");
      const singleTxnGroups = [{ txn: unsignedTx, signers: [originAccount.address] }];
      const signedTxn = await this.pera.signTransaction([singleTxnGroups]);
      const { txId } = await algod.sendRawTransaction(signedTxn).do();
      console.log(txId);
      return txId as string;
    }
  };

  convertNativeAddressToHex = (address: string): string => {
    if (this.isCardano()) {
      return bech32ToHexAddress(address);
    } else {
      return hexlify(toUtf8Bytes(address));
    }
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
    const l1Destination = this.convertNativeAddressToHex(destinationAddress);

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
          to: l1Destination,
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
          to: l1Destination,
          amount: amountToUnwrap.toFixed(0),
        },
        {
          gasLimit: 1_000_000,
          value: ethers.utils.parseEther(
            this.stargateGeneric.stargateMinNativeTokenToL1().toString()
          ),
        }
      );

      console.log("Unwrapping Asset");
      console.log(tx.hash);
      await tx.wait();
      return tx.hash;
    }
  };

  // algorand note helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decodeNote = (encodedNote: any): string => {
    return Buffer.from(encodedNote, "base64").toString();
  };

  encodeNote = (note: string): Uint8Array => {
    return new TextEncoder().encode(note);
  };

  algoToMicro = (value: string): string => {
    return new BigNumber(value).multipliedBy(new BigNumber(1_000_000)).toString();
  };

  microToAlgo = (value: string): string => {
    return new BigNumber(value).div(new BigNumber(1_000_000)).toString();
  };
}

export default BridgeActions;

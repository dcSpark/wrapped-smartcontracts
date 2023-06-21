import { ethers } from "ethers";
import { ADAStargateApiResponse, AlgoStargateApiResponse } from "./CardanoPendingManger";

export class GenericStargate {
  readonly cardanoDecimals = 6;
  stargateResponse: AlgoStargateApiResponse | ADAStargateApiResponse;

  constructor(stargateResponse: AlgoStargateApiResponse | ADAStargateApiResponse) {
    this.stargateResponse = stargateResponse;
  }

  isADAStargateApiResponse(
    stargateResponse: AlgoStargateApiResponse | ADAStargateApiResponse
  ): stargateResponse is ADAStargateApiResponse {
    return (stargateResponse as ADAStargateApiResponse).ada !== undefined;
  }

  fromNativeTokenInLoveLaceOrMicroAlgo(): string {
    if (this.isADAStargateApiResponse(this.stargateResponse)) {
      return this.stargateResponse.ada.fromADAFeeLovelace;
    } else {
      return this.stargateResponse.algo.wrappingFee;
    }
  }

  stargateMinNativeTokenFromL1(): number {
    if (this.isADAStargateApiResponse(this.stargateResponse)) {
      return (
        (parseInt(this.stargateResponse.ada.fromADAFeeLovelace) +
          parseInt(this.stargateResponse.ada.minLovelace)) /
        10 ** this.cardanoDecimals
      );
    } else {
      return (
        (parseInt(this.stargateResponse.algo.wrappingFee) +
          parseInt(this.stargateResponse.algo.minMicroAlgo)) /
        10 ** this.stargateResponse.algo.algorandDecimals
      );
    }
  }

  nativeTokenToLovelaceOrMicroAlgo(tokens: number): number {
    if (this.isADAStargateApiResponse(this.stargateResponse)) {
      return tokens * 10 ** this.cardanoDecimals;
    } else {
      return tokens * 10 ** this.stargateResponse.algo.algorandDecimals;
    }
  }

  stargateNativeTokenFeeToL1(): number {
    let toSmallL1Fee: string;
    if (this.isADAStargateApiResponse(this.stargateResponse)) {
      toSmallL1Fee = this.stargateResponse.ada.toADAFeeGWei;
      const toToken = ethers.utils
        .parseUnits(toSmallL1Fee, 9)
        .div(10 ** 9)
        .div(10 ** 9);
      return toToken.toNumber();
    } else {
      toSmallL1Fee = this.stargateResponse.algo.unwrappingFee;
      const toToken = ethers.utils
        .parseUnits(toSmallL1Fee, 6)
        .div(10 ** 6)
        .div(10 ** 6);
      return toToken.toNumber();
    }
  }

  stargateMinNativeTokenToL1(): number {
    const toL1Fee = this.stargateNativeTokenFeeToL1();
    let minToken: number;
    if (this.isADAStargateApiResponse(this.stargateResponse)) {
      minToken = parseInt(this.stargateResponse.ada.minLovelace) / 10 ** this.cardanoDecimals;
    } else {
      minToken =
        parseInt(this.stargateResponse.algo.minMicroAlgo) /
        10 ** this.stargateResponse.algo.algorandDecimals;
    }
    return toL1Fee + minToken;
  }
}

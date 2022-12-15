import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { ethers } from "ethers";
import type { CustomMethod, MilkomedaProvider, RequestArguments } from "../types";
import { getActorAddress } from "../utils";
import { Buffer } from "buffer";

interface SendTransactionPayload extends RequestArguments {
  readonly params: readonly [
    {
      readonly from: string;
      readonly to: string | undefined;
      readonly gas: string | undefined;
      readonly gasPrice: string | undefined;
      readonly value: string | undefined;
      readonly data: string;
      readonly nonce: string | undefined;
    }
  ];
}

const eth_sendTransaction: CustomMethod = async (
  provider: MilkomedaProvider,
  { params }: SendTransactionPayload
) => {
  const { cardanoProvider, actorFactoryAddress } = provider;
  const [transaction] = params;

  const { from, to, value, data, nonce } = transaction;

  const actorNonce =
    nonce ?? (await provider.oracleRequest({ method: "eth_getActorNonce", params: [from] }));

  const cardanoAddress = await cardanoProvider.getChangeAddress();
  const bech32Address = Address.from_bytes(Buffer.from(cardanoAddress, "hex")).to_bech32();

  if (from.toUpperCase() !== getActorAddress(actorFactoryAddress, bech32Address).toUpperCase()) {
    throw new Error("Invalid from address");
  }

  const payload = ethers.utils.defaultAbiCoder
    .encode(["uint256", "address", "uint256", "bytes"], [actorNonce, to, value ?? 0, data ?? []])
    .slice(2);

  const signedTransaction = await cardanoProvider.signData(bech32Address, payload);

  return await provider.oracleRequest({
    method: "eth_sendActorTransaction",
    params: [signedTransaction],
  });
};

export default eth_sendTransaction;

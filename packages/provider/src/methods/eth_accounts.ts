import { Buffer } from "buffer";
import { CustomMethod, MilkomedaProvider } from "../types";
import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { getActorAddress } from "../utils";

const method: CustomMethod = async ({
  cardanoProvider,
  actorFactoryAddress,
}: MilkomedaProvider) => {
  if (!(await cardanoProvider.isEnabled())) {
    return [];
  }

  const address = await cardanoProvider.getChangeAddress();

  const bech32Address = Address.from_bytes(Buffer.from(address, "hex")).to_bech32();

  return [getActorAddress(actorFactoryAddress, bech32Address)];
};

export default method;

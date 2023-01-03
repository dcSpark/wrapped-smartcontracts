import { Buffer } from "buffer";
import type { CustomMethod, MilkomedaProvider } from "../types";
import { Address } from "@dcspark/cardano-multiplatform-lib-browser";
import { getActorAddress } from "../utils";

const eth_accounts: CustomMethod = async ({
  cardanoProvider,
  actorFactoryAddress,
}: MilkomedaProvider) => {
  if (actorFactoryAddress === undefined) {
    throw new Error("Actor factory address not set. Run setup() first.");
  }

  if (!(await cardanoProvider.isEnabled())) {
    return [];
  }

  // After the page refresh the object needs to be enabled again
  await cardanoProvider.enable();

  const address = await cardanoProvider.getChangeAddress();

  const bech32Address = Address.from_bytes(Buffer.from(address, "hex")).to_bech32();

  return [getActorAddress(actorFactoryAddress, bech32Address)];
};

export default eth_accounts;

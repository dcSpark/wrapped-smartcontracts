import { expect, jest } from "@jest/globals";
import { BigNumber } from "bignumber.js";
import WSCLib from "../src/wscLib";
import { MilkomedaNetworkName } from "../src/WSCLibTypes";
import BridgeActions from "../src/BridgeActions";

describe("WSCLib", () => {
  let lib: WSCLib;

  beforeEach(async () => {
    lib = new WSCLib(MilkomedaNetworkName.C1Devnet, "flint", {
      oracleUrl: process.env.REACT_APP_WSC_ORACLE,
      blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
      jsonRpcProviderUrl: undefined,
    });
    await lib.loadLucid();
  });

  it("should return token balances", async () => {
    const balances = await lib.origin_getTokenBalances();
    expect(balances).toHaveLength(2);
    expect(balances[0]).toHaveProperty("unit", "microAlgo");
    expect(balances[1]).toHaveProperty("unit", "lovelace");
  });

  it("should unwrap tokens", async () => {
    // Mock necessary methods
    const mockGetAddress = jest.spyOn(lib, "origin_getAddress").mockResolvedValue("testAddress");
    const mockUnwrap = jest.spyOn(BridgeActions.prototype, "unwrap").mockResolvedValue("testAddress");

    const assetId = "assetId";
    const amount = new BigNumber(100);

    await lib.unwrap(undefined, assetId, amount);

    expect(mockGetAddress).toBeCalledTimes(1);
    expect(mockUnwrap).toBeCalledWith("testAddress", assetId, amount);
    // Remember to restore mocks after test
    mockGetAddress.mockRestore();
    mockUnwrap.mockRestore();
  });
});

import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import server from "../../src";
import config from "../../src/config";

chai.use(chaiHttp);

describe("eth_actorFactoryAddress", () => {
  it("should return correct address", async () => {
    const { body } = await chai.request(server).post("/").send({
      jsonrpc: "2.0",
      method: "eth_actorFactoryAddress",
      params: [],
      id: 1,
    });

    expect(body).to.have.property("result");
    expect(body).to.not.have.property("error");

    const { result: actorFactoryAddress } = body;

    expect(actorFactoryAddress).to.equal(config.actorFactoryAddress);
  });
});

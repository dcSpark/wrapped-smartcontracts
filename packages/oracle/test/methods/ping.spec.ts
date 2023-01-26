import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import server from "../../src";

chai.use(chaiHttp);

describe("Ping pong", () => {
  it("should return pong", async () => {
    const { body } = await chai.request(server).post("/").send({
      jsonrpc: "2.0",
      method: "ping",
      params: [],
      id: 1,
    });

    expect(body).to.deep.equal({
      jsonrpc: "2.0",
      result: "pong",
      id: 1,
    });
  });
});

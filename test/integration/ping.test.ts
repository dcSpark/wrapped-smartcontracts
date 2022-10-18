import { expect, request, use } from "chai";
import chaiHttp from "chai-http";

use(chaiHttp);

describe("Ping-pong", () => {
  it("should return pong", async () => {
    const result = await request("http://localhost:8080").get("/ping");

    expect(result).to.have.status(200);
    expect(result.text).to.equal("pong");
  });
});

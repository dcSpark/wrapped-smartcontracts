import express, { Request, Response } from "express";
import cors from "cors";
import { JSONRPCServer } from "json-rpc-2.0";
import methods, { fallback } from "./methods";
import config from "./config";

const app = express();
const jsonRpcServer = new JSONRPCServer();

app.use(cors());
app.use(express.json());

Object.keys(methods).forEach((method: Extract<keyof typeof methods, string>) => {
  jsonRpcServer.addMethod(method, methods[method]);
});

app.post("/", async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    if (Object.entries(payload).length === 0) {
      return res
        .status(400)
        .json({ error: "Empty body, did you forgot to set Content-Type header?" });
    }

    let response: unknown;

    if (jsonRpcServer.hasMethod(payload.method)) {
      response = await jsonRpcServer.receive(payload);
    } else {
      response = await fallback(payload);
    }

    return response ? res.json(response) : res.sendStatus(204);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.listen(config.port, () => console.log(`Server listening on port ${config.port}`));

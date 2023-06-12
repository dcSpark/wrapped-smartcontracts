import cors from "cors";
import express, { Request, Response } from "express";
import {
  createJSONRPCErrorResponse,
  JSONRPCErrorCode,
  JSONRPCErrorException,
  JSONRPCRequest,
  JSONRPCServer,
  JSONRPCServerMiddlewareNext,
} from "json-rpc-2.0";
import config from "./config";
import methods from "./methods";

const app = express();
const jsonRpcServer = new JSONRPCServer();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

Object.keys(methods).forEach((method: Extract<keyof typeof methods, string>) => {
  jsonRpcServer.addMethod(method, methods[method]);
});

app.post("/", async (req: Request, res: Response) => {
  const payload = req.body;

  if (Object.entries(payload).length === 0) {
    return res.json(
      createJSONRPCErrorResponse(
        null,
        JSONRPCErrorCode.ParseError,
        "Parse error",
        "Empty body, did you forgot to set Content-Type header to application/json?"
      )
    );
  }

  const response = await jsonRpcServer.receive(payload);

  return response ? res.json(response) : res.sendStatus(204);
});

const logMiddleware = async <ServerParams>(
  next: JSONRPCServerMiddlewareNext<ServerParams>,
  request: JSONRPCRequest,
  serverParams: ServerParams
) => {
  const response = await next(request, serverParams);

  if (config.env !== "test") {
    console.log(`Received ${JSON.stringify(request)}`);
    console.log(`Responding ${JSON.stringify(response)}`);
  }

  return response;
};

const exceptionMiddleware = async <ServerParams>(
  next: JSONRPCServerMiddlewareNext<ServerParams>,
  request: JSONRPCRequest,
  serverParams: ServerParams
) => {
  try {
    return await next(request, serverParams);
  } catch (error) {
    return createJSONRPCErrorResponse(
      request.id ?? null,
      error instanceof JSONRPCErrorException ? error.code : JSONRPCErrorCode.InternalError,
      error instanceof Error ? error.message : "Unexpected error",
      error instanceof JSONRPCErrorException ? error.data : undefined
    );
  }
};

jsonRpcServer.applyMiddleware(logMiddleware, exceptionMiddleware);

app.listen(config.port, () => console.log(`Server listening on port ${config.port}`));

export default app;

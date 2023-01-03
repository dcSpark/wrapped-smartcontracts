import { SimpleJSONRPCMethod } from "json-rpc-2.0";

const validationMiddleware = <T, R>(
  parse: (params: unknown) => T | Promise<T>,
  method: (params: T) => Promise<R>
): SimpleJSONRPCMethod => {
  return async (params: unknown) => {
    const parsedParams = await parse(params);
    return method(parsedParams);
  };
};

export default validationMiddleware;

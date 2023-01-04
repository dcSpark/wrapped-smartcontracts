import { JSONRPCErrorCode, JSONRPCErrorException, SimpleJSONRPCMethod } from "json-rpc-2.0";
import { ZodError } from "zod";

const validationMiddleware = <T, R>(
  parse: (params: unknown) => T | Promise<T>,
  method: (params: T) => Promise<R>
): SimpleJSONRPCMethod => {
  return async (params: unknown) => {
    try {
      const parsedParams = await parse(params);
      return method(parsedParams);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new JSONRPCErrorException(
          error.message,
          JSONRPCErrorCode.InvalidParams,
          error.issues
        );
      }

      throw error;
    }
  };
};

export default validationMiddleware;

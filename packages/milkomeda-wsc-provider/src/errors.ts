/**
 * Errors must be `ProviderRpcError` as per EIP1193
 * https://eips.ethereum.org/EIPS/eip-1193#errors
 */
export class ProviderRpcError extends Error {
  public name = "ProviderRpcError";

  constructor(message: string, public code: number, public data?: unknown) {
    super(message);
  }
}

export const JSON_RPC_ERROR_CODES = {
  // error codes below from the EIP-1474 standards
  // https://eips.ethereum.org/EIPS/eip-1474
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  INVALID_INPUT: -32000,
  RESOURCE_NOT_FOUND: -32001,
  RESOURCE_UNAVAILABLE: -32002,
  TRANSACTION_REJECTED: -32003,
  METHOD_NOT_SUPPORTED: -32004,
  LIMIT_EXCEEDED: -32005,
  JSON_RPC_VERSION_NOT_SUPPORTED: -32006,
  // errors codes below come from the EIP-1193 standard
  // https://eips.ethereum.org/EIPS/eip-1193#rpc-errors
  USER_REJECTED_REQUEST: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
} as const;

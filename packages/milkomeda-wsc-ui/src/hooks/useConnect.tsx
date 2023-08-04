/**
 * This is a wrapper around wagmi's useConnect hook that adds some
 * additional functionality.
 */

import { useConnect as wagmiUseConnect } from "wagmi";
import { useContext } from "../components/ConnectWSC";

/* eslint @typescript-eslint/no-explicit-any: "off" */
export function useConnect({ ...props } = {}): any {
  const context = useContext();

  const connectProps = {};

  const { connect, connectAsync, connectors, ...rest } = wagmiUseConnect({
    onError(err) {
      if (err.message) {
        if (err.message !== "User rejected request") {
          context.log(err.message, err);
        }
      } else {
        context.log(`Could not connect.`, err);
      }
    },

    ...props,
    /*
    onSuccess: (data) => {
      context.onConnect?.({
        address: data.account,
        //chainId: data.chain.id,
        connectorId: data.connector?.id,
      });
    },
    */
  });

  return {
    connect: ({ ...opts }) => {
      return connect({
        ...opts,
        ...connectProps,
      });
    },
    connectAsync: async ({ ...opts }) => {
      return await connectAsync({
        ...opts,
        ...connectProps,
      });
    },
    connectors,
    ...rest,
  };
}

import fallback from "./fallback";
import ping from "./ping";

const methods: { [key: string]: () => unknown } = {
  ping,
};

export { fallback };
export default methods;

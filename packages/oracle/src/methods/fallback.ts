import axios from "axios";
import config from "../config";

const fallback = async (payload: unknown) => {
  const response = await axios.post(config.jsonRpcProviderUrl, payload, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "",
    },
  });

  return response.data;
};

export default fallback;

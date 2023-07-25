import type { NextPage } from "next";
import { useWSCProvider } from "milkomeda-wsc-ui";
import { WSCInterface } from "milkomeda-wsc-ui";

const WscInterface: NextPage = () => {
  const { isWSCConnected } = useWSCProvider();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {isWSCConnected && <WSCInterface />}
    </div>
  );
};

export default WscInterface;

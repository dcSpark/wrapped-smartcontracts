import type { NextPage } from "next";
import { useWSCProvider } from "milkomeda-wsc-ui";
import { WSCInterface } from "milkomeda-wsc-ui";

const OptionA: NextPage = () => {
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
      <div style={{ maxWidth: 600, width: "100%", margin: "0 auto" }}>
        {isWSCConnected && <WSCInterface />}
      </div>
    </div>
  );
};

export default OptionA;

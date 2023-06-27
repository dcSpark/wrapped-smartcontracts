import type { NextPage } from "next";
import { ConnectWSCButton } from "milkomeda-wsc-ui";

const Home: NextPage = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <ConnectWSCButton />
    </div>
  );
};

export default Home;

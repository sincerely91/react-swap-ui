import type { NextPage } from "next";
import style from "../styles/Home.module.sass";

const Home: NextPage = () => {
  return (
    <div
      className={style.home}
      style={{
        backgroundImage: `url("/bg.jpeg")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: "4rem",
          width: "100%",
          fontFamily: "monospace",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}
      >
        Your Solana Wonderland
      </div>
    </div>
  );
};

export default Home;

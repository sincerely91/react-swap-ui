import { url } from "inspector";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
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
      {/* <div
        style={{
          width: "max-content",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          flexDirection: "column"
        }}
      > */}
      {/* <img src="/dappio.jpeg" alt="" style={{ width: "100%", top: "" }} /> */}
      <div
        style={{
          // color: "#fbae21",
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
      {/* </div> */}
    </div>
  );
};

export default Home;

import type { AppProps } from "next/app";
import { Wallet } from "../views/commons/WalletProvider";
import Navigator from "../views/commons/Navigator";
import "../styles/globals.css";
import Head from "next/head";

function SwapUI({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>swap-ui-example</title>
        <meta name="description" content="Your Solana Wonderland" />
        <meta property="og:title" content="Dappio" />
        <meta property="og:description" content="Your Solana Wonderland" />
        <meta property="og:url" content="https://swap-ui-example.dappio.xyz/" />
        <meta
          property="og:image"
          content="https://swap-ui-example.dappio.xyz/og-image.png"
        />
        <meta property="twitter:title" content="Dappio" />
        <meta property="twitter:description" content="Your Solana Wonderland" />
        <meta property="twitter:site" content="@Dappio_" />
        <meta
          property="twitter:url"
          content="https://swap-ui-example.dappio.xyz"
        />
        <meta property="twitter:creator" content="@Dappio_" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:image"
          content="https://swap-ui-example.dappio.xyz/og-image.png"
        />
      </Head>
      <Wallet>
        <Navigator />
        <Component {...pageProps} />
      </Wallet>
    </>
  );
}

export default SwapUI;

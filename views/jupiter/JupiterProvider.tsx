import { FunctionComponent } from "react";
import { JupiterProvider } from "@jup-ag/react-hook";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz", {
  wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
  commitment: "processed"
});

const Jupiter: FunctionComponent = ({ children }) => {
  const wallet = useWallet();
  return (
    <JupiterProvider
      connection={connection}
      cluster="mainnet-beta"
      userPublicKey={wallet.publicKey || undefined}
    >
      {children}
    </JupiterProvider>
  );
};

export default Jupiter;

import { JupiterProvider } from "@jup-ag/react-hook";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

// which RPC to use to send transaction
// const connection = new Connection("https://solana-api.projectserum.com");
const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz");

//@ts-ignore
const Jupiter = ({ children }) => {
  const wallet = useWallet(); // user wallet
  return (
    <JupiterProvider
      connection={connection}
      cluster="mainnet-beta"
      userPublicKey={wallet.publicKey || undefined}
    >
      <h4>{wallet.publicKey?.toBase58()}</h4>
      {children}
    </JupiterProvider>
  );
};

export default Jupiter;

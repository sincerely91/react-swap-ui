import { JupiterProvider } from "@jup-ag/react-hook";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz");

//@ts-ignore
const Jupiter = ({ children }) => {
  const wallet = useWallet();
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

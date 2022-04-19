import { Connection } from "@solana/web3.js";
import { useContext, createContext } from "react";

const DappContext = createContext<DappContextType>({
    splTokens: undefined,
    connection: new Connection("https://rpc-mainnet-fork.dappio.xyz", {
        wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
        commitment: "processed",
    }),
    setNotify: null,
    setLoading: null,
})

export default function useDapp() {
    return useContext(DappContext)
}

export {DappContext}

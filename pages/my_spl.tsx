import { useEffect, useMemo, useState } from "react";
import useDapp from "../hooks/useDapp"
import { TOKENS } from "../utils/tokens";
import style from "../styles/mySpl.module.sass"
import { useWallet } from "@solana/wallet-adapter-react";


export default function MySplPage() {

    const {splTokens, setNotify} = useDapp()

    const wallet = useWallet()
    
    const [tokenList, setTokenList] = useState<SplTokenDisplayData[]>([]);
    
    useEffect(()=>{                                                                     // Show error notify if there !wallet.connected
        setTokenList(updateTokenList())
        if (!wallet.connected) {
            setNotify!({
                status: "error",
                title: "Wallet not connected",
                description: "Please login with your wallet",
            })
            return
        }
        setNotify!(null)
    }, [])
    
    function updateTokenList(): SplTokenDisplayData[] {
        let tokenList = [];
        for (const [_, value] of Object.entries(TOKENS)) {
            let spl: ISplToken | undefined = splTokens?.find(
                (t: ISplToken) => t.parsedInfo.mint === value.mintAddress
            );
            
            if (spl) {
                let token = {} as SplTokenDisplayData;
                token["symbol"] = value.symbol;
                token["mint"] = spl?.parsedInfo.mint;
                token["pubkey"] = spl?.pubkey;
                token["amount"] = spl?.amount;
                tokenList.push(token);
            }
        }
        return tokenList
    }

    return <>
        <div className={style.splTokenList}>
            {tokenList.map((item ) => {
                return (
                <div key={item.mint} className={style.item}  >
                    <div>
                    <span style={{ marginRight: "1rem", fontWeight: "600" }}>
                        {item.symbol}
                    </span>
                    <span>- {item.amount}</span>
                    </div>
                    <div style={{ opacity: ".25" }}>
                    <div>Mint: {item.mint}</div>
                    <div>Pubkey: {item.pubkey}</div>
                    </div>
                </div>
                );
            })}
        </div>
    </>
}
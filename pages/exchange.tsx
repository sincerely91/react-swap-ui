import SplTokenList from "../components/common/SplTokenList"
import SwapPage from "../components/raydium"
import useDapp from "../hooks/useDapp"


export default function ExchangePage() {
    const {splTokens} = useDapp()
    return <>
    <div style={{padding: "30px"}}>
        <SwapPage />
    </div>
        
    </>
}
import Head from 'next/head'
import Header from "./Header"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { getSPLTokenData } from "../../utils/web3"
import { useEffect, useState } from "react"
import { DappContext } from "../../hooks/useDapp"
// import { Liquidity, LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk'
import Loading from '../common/Loading'
import Notify from '../common/Notify'
import style from '../../styles/layout.module.sass'

function Layout({...props}): JSX.Element {

    const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz", {
        wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
        commitment: "processed"
    });
    // -->                                                                                // 3rd party Hooks
    const wallet = useWallet();

    // -->                                                                                // React Hooks
    const [splTokenData, setSplTokenData] = useState<ISplToken[]>([]);
    // const [poolKeys, setPoolKeys] = useState<LiquidityPoolKeysV4[]>([])
    const [notify, setNotify] = useState<INotify | null>(null);
    const [loading, setLoading] = useState<LoadingType | null>(null);

    useEffect(()=>{                                                                       // Show notify component for 5s if there is any
        if (notify) {
            setTimeout(()=>setNotify(null), 5000)
        }
    }, [notify])

    // useEffect(()=>{
    //     Liquidity.fetchAllPoolKeys(connection).then((pools: LiquidityPoolKeysV4[])=>{
    //         setPoolKeys(pools)
    //     })
    // }, [wallet.connected])

    useEffect(() => {
        if (wallet.connected) {
            setLoading({
                msg: "Loading spl tokens"
            })
            getSPLTokenData(wallet, connection).then((tokenList: ISplToken[]) => {
                if (tokenList) {
                    setSplTokenData(() => tokenList.filter(t => t !== undefined));
                }
                setLoading(null)
            });
        } else {
            setSplTokenData([])
        }
    }, [wallet.connected]);

    return <>
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            {/* fontawesome */}
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.3/css/all.css" integrity="sha384-SZXxX4whJ79/gErwcOYf+zWLeJdY/qpuqC4cAa9rOGUstPomtqpuNWT9wdPEn2fk" crossOrigin="anonymous"/>
            <title>Solana DAPP Boilerplate</title>
        </Head>

        <div  >
            <Header />
            {notify && <Notify message={notify} />}
            {loading && <Loading data={loading} />}
            <DappContext.Provider value={{
                splTokens: splTokenData,
                connection: new Connection("https://rpc-mainnet-fork.dappio.xyz", {
                    wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
                    commitment: "processed"
                }),
                setNotify: setNotify,
                setLoading: setLoading
            }}>
                <main className={style.layoutContainer}>{props.children}</main>
            </DappContext.Provider>
        </div>
    </>
}


export default Layout

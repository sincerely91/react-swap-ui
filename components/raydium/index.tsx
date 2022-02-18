import { useState, useEffect, FunctionComponent } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPoolByTokenMintAddresses } from "../../utils/pools";
import { swap, getSwapOutAmount, setupPools } from "../../utils/swap";
import { getSPLTokenData } from "../../utils/web3";
import useDapp from "../../hooks/useDapp";
import TokenList from "./TokenList";
import SwapOperateContainer from "./SwapOperateContainer";

const SwapPage: FunctionComponent = () => {
                                                                              // React Hooks
  const [showTokenList, setShowTokenList] = useState(false);
  const [showSlippageSetting, setShowSlippageSetting] = useState(false);
  const [selectType, setSelectType] = useState<"From" | "To" | undefined>("From");
  const [fromData, setFromData] = useState<TokenData>({} as TokenData);
  const [toData, setToData] = useState<TokenData>({} as TokenData);
  const [slippageValue, setSlippageValue] = useState(1);
  const [splTokenData, setSplTokenData] = useState<ISplToken[]>([]);
  const [liquidityPools, setLiquidityPools] = useState<any>("");
                                                                            // Other Hooks
  let wallet = useWallet();
  let { connection, splTokens, notify, setNotify, setLoading } = useDapp()

  useEffect(()=>{
    splTokens && setSplTokenData(splTokens)
  }, [splTokens])

  useEffect(() => {                                                         // Setup Liquidity Pools
    setLoading!({
      msg: "Loading Liquidity Pools"
    });
    setupPools(connection).then(data => {
      setLiquidityPools(data);
      setLoading!(null)
    });
    return () => {
      setLiquidityPools("");
    };
  }, []);

  const updateAmount = (e: IUpdateAmountData) => {
    if (e.type === "From") {
      setFromData((old: TokenData) => ({
        ...old,
        amount: e.amount
      }));

      if (!e.amount) {
        setToData((old: TokenData) => ({
          ...old,
          amount: 0
        }));
      }
    }
  };

  const updateSwapOutAmount = () => {
    if (
      fromData.amount! > 0 &&
      fromData.tokenInfo?.symbol &&
      toData.tokenInfo?.symbol
    ) {
                                                                              // Get LP info 
      let poolInfo = getPoolByTokenMintAddresses(
        fromData.tokenInfo.mintAddress,
        toData.tokenInfo.mintAddress
      );

      if (!poolInfo) {                                                        // If get no LP then trigger notification                          
        setNotify!(() => ({                                                    /** @TODO Manual update pool?? how to get the Liquidity pool in util auto update? */
          status: "error",
          title: "AMM error",
          description: "Current token pair pool not found"        
        }));
        return;
      }

      let parsedPoolsData = liquidityPools;
      let parsedPoolInfo = parsedPoolsData[poolInfo?.lp.mintAddress];

      // //@ts-ignore
      const { amountOutWithSlippage } = getSwapOutAmount(
        parsedPoolInfo,
        fromData.tokenInfo.mintAddress,
        toData.tokenInfo.mintAddress,
        fromData.amount!.toString(),
        slippageValue
      );

      setToData((old: TokenData) => ({
        ...old,
        amount: parseFloat(amountOutWithSlippage.fixed())
      }));
    }
  };

  useEffect(() => {                                                         // Update SwapOut Amount when there is change of src or dist coins or slippage 
    updateSwapOutAmount();
  }, [fromData, toData.tokenInfo?.symbol, slippageValue]);

  const toggleTokenList = (type: "From"|"To" | undefined) => {                                           /**@Param e: selected type  */
    setShowTokenList(() => !showTokenList);
    setSelectType(type)
  };

  const toggleSlippageSetting = () => {                                     // pop-up slippage selection
    setShowSlippageSetting(() => !showSlippageSetting);
  };

  const getSlippageValue = (e: number) => {
    if (!e) {
      setSlippageValue(() => e);
    } else {
      setSlippageValue(() => e);
    }
  };

  const switchFromAndTo = () => {
    const fromToken = fromData.tokenInfo;
    const toToken = toData.tokenInfo;
    setFromData((old: TokenData) => ({
      ...old,
      tokenInfo: toToken,
      amount: null
    }));

    setToData((old: TokenData) => ({
      ...old,
      tokenInfo: fromToken,
      amount: null
    }));
  };

  const getTokenInfo = (e: ITokenInfo) => {                                // Set src and dist coin when user select
    if (selectType === "From") {                                           // When user selects src token which is the same as current dist coin
      if (toData.tokenInfo?.symbol === e?.symbol) {
        setToData((old: TokenData) => ({
          ...old,
          tokenInfo: {
            symbol: "",
            mintAddress: "",
            logoURI: ""
          }
        }));
      }

      setFromData((old: TokenData) => ({
        ...old,
        tokenInfo: e
      }));
    } else {                                                              // Else when user selects dist token which is the same as current src coin
      if (fromData.tokenInfo?.symbol === e.symbol) {
        setFromData((old: TokenData) => ({
          ...old,
          tokenInfo: {
            symbol: "",
            mintAddress: "",
            logoURI: ""
          }
        }));
      }

      setToData((old: TokenData) => ({
        ...old,
        tokenInfo: e
      }));
    }
  };

  const sendSwapTransaction = async () => {
    let poolInfo = getPoolByTokenMintAddresses(
      fromData.tokenInfo.mintAddress,
      toData.tokenInfo.mintAddress
    );

    let fromTokenAccount: ISplToken | undefined | string = splTokenData.find(
      (token: ISplToken) =>
        token.parsedInfo.mint === fromData.tokenInfo.mintAddress
    );
    if (fromTokenAccount) {
      fromTokenAccount = fromTokenAccount.pubkey;
    } else {
      fromTokenAccount = "";
    }

    let toTokenAccount: ISplToken | undefined | string = splTokenData.find(
      (token: ISplToken) =>
        token.parsedInfo.mint === toData.tokenInfo.mintAddress
    );
    if (toTokenAccount) {
      toTokenAccount = toTokenAccount.pubkey;
    } else {
      toTokenAccount = "";
    }

    let wsol: ISplToken | undefined = splTokenData.find(
      (token: ISplToken) =>
        token.parsedInfo.mint === "So11111111111111111111111111111111111111112"
    );
    let wsolMint: string = "";
    if (wsol) {
      wsolMint = wsol.parsedInfo.mint;
    }

    if (poolInfo === undefined) {
      alert("Pool not exist");
      return;
    }

    swap(
      connection,
      wallet,
      poolInfo,
      fromData.tokenInfo.mintAddress,
      toData.tokenInfo.mintAddress,
      fromTokenAccount,
      toTokenAccount,
      fromData.amount!.toString(),
      toData.amount!.toString(),
      wsolMint
    ).then(async res => {
      setNotify!(() => ({                                                    
        status: "error",
        title: "AMM error",
        description: "Current token pair pool not found"        
      }));

      let result = await connection.confirmTransaction(res);

      if (!result.value.err) {
        setNotify!({
          status: "success",
          title: "Transaction Success",
          description: "",
        });
      } else {
        setNotify!({
          status: "success",
          title: "Fail",
          description: "Transaction fail, please check below link",
          link: `https://explorer.solana.com/address/${res}`
        });
      }

      getSPLTokenData(wallet, connection).then((tokenList: ISplToken[]) => {
        if (tokenList) {
          setSplTokenData(() =>
            tokenList.filter((t: ISplToken) => t !== undefined)
          );
        }
      });
    });
  };

  useEffect(() => {
    if (wallet.connected) {
      setNotify!({
        status: "success",
        title: "Wallet connected",
        description: wallet.publicKey?.toBase58() as string
      });
    } else {
      let description = wallet.publicKey?.toBase58();
      if (!description) {
        description = "Please try again";
      }
      setNotify!({
        status: "error",
        title: "Wallet disconnected",
        description: description as string
      });
    }

  }, [wallet.connected]);

  return (
    <div>
      <TokenList
        showTokenList={showTokenList}
        toggleTokenList={() => toggleTokenList(undefined)}
        getTokenInfo={getTokenInfo}
      />
      <SwapOperateContainer
        toggleTokenList={toggleTokenList}
        fromData={fromData}
        toData={toData}
        updateAmount={updateAmount}
        switchFromAndTo={switchFromAndTo}
        slippageValue={slippageValue}
        sendSwapTransaction={sendSwapTransaction}
        splTokenData={splTokens ? splTokens : []}
      />
      
    </div>
  );
};

export default SwapPage;

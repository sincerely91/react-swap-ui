import style from "../../styles/swap.module.sass";
import TokenList from "./TokenList";
import SlippageSetting from "./SlippageSetting";
import SwapOperateContainer from "./SwapOperateContainer";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { TOKENS } from "../../utils/tokens";
import { TOKEN_PROGRAM_ID } from "../../utils/ids";
import { getPoolByTokenMintAddresses } from "../../utils/pools";
import { swap, getSwapOutAmount, setupPools } from "../../utils/swap";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

const SwapPage = (): JSX.Element => {
  const [showTokenList, setShowTokenList] = useState(false);
  const [showSlippageSetting, setShowSlippageSetting] = useState(false);
  const [selectType, setSelectType] = useState<any>("From");
  const [fromData, setFromData] = useState<any>({});
  const [toData, setToData] = useState<any>({});
  const [slippageValue, setSlippageValue] = useState(1);
  const [accountInfo, setAccountInfo] = useState<any>("");
  const [splTokenData, setSplTokenData] = useState<any>([]);
  const [liquidityPools, setLiquidityPools] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  let wallet: any = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    setIsLoading(true);
    setupPools(connection).then(data => {
      setLiquidityPools(data);
      setIsLoading(false);
    });
    return () => {
      setLiquidityPools("");
    };
  }, []);

  useEffect(() => {
    const getAccountInfo = async () => {
      if (!wallet.connected) {
        return;
      }
      let key = await wallet.publicKey?.toBase58();
      let data = await connection.getAccountInfo(new PublicKey(key));
      setAccountInfo(data);
    };

    getSPLTokenData();
    getAccountInfo();
    return () => {
      setAccountInfo("");
    };
  }, [wallet.connected]);

  const updateAmount = (e: any) => {
    if (e.type === "From") {
      setFromData((old: any) => ({
        ...old,
        amount: e.amount
      }));

      if (e.amount === "") {
        setToData((old: any) => ({
          ...old,
          amount: 0
        }));
      }
    }
  };

  const updateSwapOutAmount = () => {
    if (
      fromData.amount > 0 &&
      fromData.tokenInfo?.symbol &&
      toData.tokenInfo?.symbol
    ) {
      let poolInfo = getPoolByTokenMintAddresses(
        fromData.tokenInfo.mintAddress,
        toData.tokenInfo.mintAddress
      );
      if (!poolInfo) {
        alert("Pool not found");
        return;
      }

      let parsedPoolsData = liquidityPools;
      let parsedPoolInfo = parsedPoolsData[poolInfo?.lp.mintAddress];

      // //@ts-ignore
      const { amountOutWithSlippage } = getSwapOutAmount(
        parsedPoolInfo,
        fromData.tokenInfo.mintAddress,
        toData.tokenInfo.mintAddress,
        fromData.amount,
        slippageValue
      );

      setToData((old: any) => ({
        ...old,
        amount: amountOutWithSlippage.fixed()
      }));
    }
  };

  useEffect(() => {
    updateSwapOutAmount();
  }, [fromData]);

  useEffect(() => {
    updateSwapOutAmount();
  }, [toData.tokenInfo?.symbol]);

  const toggleTokenList = (e: any) => {
    setShowTokenList(() => !showTokenList);
    setSelectType(() => e);
  };

  const toggleSlippageSetting = () => {
    setShowSlippageSetting(() => !showSlippageSetting);
  };

  const getSlippageValue = (e: any) => {
    if (e === "") {
      setSlippageValue(() => e);
    } else {
      setSlippageValue(() => parseFloat(e));
    }
  };

  const switchFromAndTo = () => {
    const fromToken = fromData.tokenInfo;
    const toToken = toData.tokenInfo;
    setFromData((old: any) => ({
      ...old,
      tokenInfo: toToken,
      amount: ""
    }));

    setToData((old: any) => ({
      ...old,
      tokenInfo: fromToken,
      amount: ""
    }));
  };

  const getTokenInfo = (e: any) => {
    if (selectType === "From") {
      if (toData.tokenInfo?.symbol === e?.symbol) {
        setToData((old: any) => ({
          ...old,
          tokenInfo: ""
        }));
      }

      setFromData((old: any) => ({
        ...old,
        tokenInfo: e
      }));
    } else {
      if (fromData.tokenInfo?.symbol === e.symbol) {
        setFromData((old: any) => ({
          ...old,
          tokenInfo: ""
        }));
      }

      setToData((old: any) => ({
        ...old,
        tokenInfo: e
      }));
    }
  };

  const getSPLTokenData = async () => {
    if (!wallet.connected) {
      return;
    }
    connection
      .getParsedTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: new PublicKey(TOKEN_PROGRAM_ID)
        },
        "confirmed"
      )
      .then(res => {
        return res.value.map((item, index) => {
          let token = {
            pubkey: item.pubkey.toBase58(),
            parsedInfo: item.account.data.parsed.info,
            amount:
              item.account.data.parsed.info.tokenAmount.amount /
              10 ** item.account.data.parsed.info.tokenAmount.decimals
          };

          if (item.account.data.parsed.info.tokenAmount.decimals === 0) {
            return undefined;
          } else {
            return token;
          }
        });
      })
      .then(async (tokenList: any) => {
        setSplTokenData(() => tokenList.filter((t: any) => t !== undefined));
      });
  };

  const SPLToken = (): JSX.Element => {
    let tokenList: any = [];
    if (splTokenData.length === 0) {
      return <></>;
    }

    for (const [_, value] of Object.entries(TOKENS)) {
      let token = splTokenData.find(
        (t: any) => t.parsedInfo.mint === value.mintAddress
      );
      if (token) {
        token["symbol"] = value.symbol;
        token["mint"] = token?.parsedInfo.mint;
        token["pubkey"] = token?.pubkey;
        token["amount"] = token?.amount;
        tokenList.push(token);
      }
    }

    let tokens = tokenList.map((item: any) => {
      return (
        <div key={item.mint} className={style.splTokenItem}>
          <div>Symbol: {item.symbol}</div>
          <div>Mint: {item.mint}</div>
          <div>Pubkey: {item.pubkey}</div>
          <div>Amount: {item.amount}</div>
        </div>
      );
    });

    return (
      <div className={style.splTokenContainer}>
        <div className={style.splTokenListTitle}>Your Tokens</div>
        {tokens}
      </div>
    );
  };

  const sendSwapTransaction = async () => {
    let poolInfo = getPoolByTokenMintAddresses(
      fromData.tokenInfo.mintAddress,
      toData.tokenInfo.mintAddress
    );

    let fromTokenAccount = splTokenData.find(
      (token: any) => token.parsedInfo.mint === fromData.tokenInfo.mintAddress
    );
    if (fromTokenAccount) {
      fromTokenAccount = fromTokenAccount.pubkey;
    } else {
      fromTokenAccount = "";
    }
    console.log(fromTokenAccount, "fromTokenAccount");

    let toTokenAccount = splTokenData.find(
      (token: any) => token.parsedInfo.mint === toData.tokenInfo.mintAddress
    );
    if (toTokenAccount) {
      toTokenAccount = toTokenAccount.pubkey;
    } else {
      toTokenAccount = "";
    }

    let wsol = splTokenData.find(
      (token: any) =>
        token.mint === "So11111111111111111111111111111111111111112"
    );
    if (wsol) {
      wsol = wsol.mint;
    } else {
      wsol = "";
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
      fromData.amount,
      toData.amount,
      wsol
    ).then(res => {
      console.log("tx: ", res);
    });
  };

  return (
    <div className={style.swapPage}>
      {isLoading ? (
        <div
          style={{
            fontSize: "2rem",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          Loading Pool Info
        </div>
      ) : (
        ""
      )}
      {wallet.connected ? <SPLToken /> : ""}
      <SlippageSetting
        showSlippageSetting={showSlippageSetting}
        toggleSlippageSetting={toggleSlippageSetting}
        getSlippageValue={getSlippageValue}
        slippageValue={slippageValue}
      />
      <TokenList
        showTokenList={showTokenList}
        toggleTokenList={toggleTokenList}
        getTokenInfo={getTokenInfo}
      />
      <div className={style.container}>
        <SwapOperateContainer
          toggleTokenList={toggleTokenList}
          fromData={fromData}
          toData={toData}
          updateAmount={updateAmount}
          switchFromAndTo={switchFromAndTo}
          slippageValue={slippageValue}
          accountInfo={accountInfo}
          sendSwapTransaction={sendSwapTransaction}
        />
      </div>
    </div>
  );
};

export default SwapPage;

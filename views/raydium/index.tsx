import { useState, useEffect, FunctionComponent } from "react";
import TokenList from "./TokenList";
import TitleRow from "./TitleRow";
import SlippageSetting from "./SlippageSetting";
import SwapOperateContainer from "./SwapOperateContainer";
import { PublicKey, Connection } from "@solana/web3.js";
import { Spinner } from "@chakra-ui/react";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { getPoolByTokenMintAddresses } from "../../utils/pools";
import { swap, getSwapOutAmount, setupPools } from "../../utils/swap";
import { getSPLTokenData } from "../../utils/web3";
import Notify from "../commons/Notify";
import { INotify } from "../commons/Notify";
import SplTokenList from "../commons/SplTokenList";
import { ISplToken } from "../../utils/web3";
import { IUpdateAmountData } from "./TokenSelect";
import style from "../../styles/swap.module.sass";

export interface ITokenInfo {
  symbol: string;
  mintAddress: string;
  logoURI: string;
}
export interface TokenData {
  amount: number | null;
  tokenInfo: ITokenInfo;
}

const SwapPage: FunctionComponent = () => {
  const [showTokenList, setShowTokenList] = useState(false);
  const [showSlippageSetting, setShowSlippageSetting] = useState(false);
  const [selectType, setSelectType] = useState<string>("From");
  const [fromData, setFromData] = useState<TokenData>({} as TokenData);
  const [toData, setToData] = useState<TokenData>({} as TokenData);
  const [slippageValue, setSlippageValue] = useState(1);
  const [splTokenData, setSplTokenData] = useState<ISplToken[]>([]);
  const [liquidityPools, setLiquidityPools] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notify, setNotify] = useState<INotify>({
    status: "info",
    title: "",
    description: "",
    link: ""
  });
  const [showNotify, toggleNotify] = useState<Boolean>(false);

  let wallet: WalletContextState = useWallet();
  const connection = new Connection("https://rpc-mainnet-fork.dappio.xyz", {
    wsEndpoint: "wss://rpc-mainnet-fork.dappio.xyz/ws",
    commitment: "processed"
  });

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
    if (wallet.connected) {
      getSPLTokenData(wallet, connection).then((tokenList: ISplToken[]) => {
        if (tokenList) {
          setSplTokenData(() => tokenList.filter(t => t !== undefined));
        }
      });
    }
  }, [wallet.connected]);

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
      let poolInfo = getPoolByTokenMintAddresses(
        fromData.tokenInfo.mintAddress,
        toData.tokenInfo.mintAddress
      );
      if (!poolInfo) {
        setNotify((old: INotify) => ({
          ...old,
          status: "error",
          title: "AMM error",
          description: "Current token pair pool not found"
        }));
        toggleNotify(true);
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

  useEffect(() => {
    updateSwapOutAmount();
  }, [fromData]);

  useEffect(() => {
    updateSwapOutAmount();
  }, [toData.tokenInfo?.symbol]);

  useEffect(() => {
    updateSwapOutAmount();
  }, [slippageValue]);

  const toggleTokenList = (e: any) => {
    setShowTokenList(() => !showTokenList);
    setSelectType(() => e);
  };

  const toggleSlippageSetting = () => {
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

  const getTokenInfo = (e: any) => {
    if (selectType === "From") {
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
    } else {
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
      toggleNotify(true);
      setNotify((old: INotify) => ({
        ...old,
        status: "success",
        title: "Transaction Send",
        description: "",
        link: `https://explorer.solana.com/address/${res}`
      }));

      let result = await connection.confirmTransaction(res);

      if (!result.value.err) {
        setNotify((old: INotify) => ({
          ...old,
          status: "success",
          title: "Transaction Success"
        }));
      } else {
        setNotify((old: INotify) => ({
          ...old,
          status: "success",
          title: "Fail",
          description: "Transaction fail, please check below link",
          link: `https://explorer.solana.com/address/${res}`
        }));
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
    const time = setTimeout(() => {
      toggleNotify(false);
    }, 8000);

    return () => clearTimeout(time);
  }, [notify]);

  useEffect(() => {
    if (wallet.connected) {
      setNotify((old: INotify) => ({
        ...old,
        status: "success",
        title: "Wallet connected",
        description: wallet.publicKey?.toBase58() as string
      }));
    } else {
      let description = wallet.publicKey?.toBase58();
      if (!description) {
        description = "Please try again";
      }
      setNotify((old: INotify) => ({
        ...old,
        status: "error",
        title: "Wallet disconnected",
        description: description as string
      }));
    }

    toggleNotify(true);
  }, [wallet.connected]);

  return (
    <div className={style.swapPage}>
      {isLoading ? (
        <div className={style.loading}>
          Loading raydium amm pool <Spinner />
        </div>
      ) : (
        ""
      )}
      <SplTokenList splTokenData={splTokenData} />
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
        {isLoading ? (
          ""
        ) : (
          <>
            <TitleRow
              toggleSlippageSetting={toggleSlippageSetting}
              fromData={fromData}
              toData={toData}
              updateSwapOutAmount={updateSwapOutAmount}
            />
            <SwapOperateContainer
              toggleTokenList={toggleTokenList}
              fromData={fromData}
              toData={toData}
              updateAmount={updateAmount}
              switchFromAndTo={switchFromAndTo}
              slippageValue={slippageValue}
              sendSwapTransaction={sendSwapTransaction}
              splTokenData={splTokenData}
            />
          </>
        )}
      </div>
      {showNotify ? <Notify message={notify} /> : null}
    </div>
  );
};

export default SwapPage;

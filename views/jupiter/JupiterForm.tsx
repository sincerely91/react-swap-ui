import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useJupiter } from "@jup-ag/react-hook";
import { ENV as ENVChainId } from "@solana/spl-token-registry";
import FeeInfo from "./FeeInfo";
import { getSPLTokenData, ISplToken } from "../../utils/web3";
import SplTokenList from "../commons/SplTokenList";
import style from "../../styles/jupiter.module.sass";

const CHAIN_ID = ENVChainId.MainnetBeta;
interface IJupiterFormProps {}
interface IToken {
  mint: string;
  symbol: string;
}
type UseJupiterProps = Parameters<typeof useJupiter>[0];

const JupiterForm: FunctionComponent<IJupiterFormProps> = props => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  const [formValue, setFormValue] = useState<UseJupiterProps>({
    amount: 1,
    inputMint: undefined,
    outputMint: undefined,
    slippage: 1 // 1%
  });

  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokenMap.get(formValue.inputMint?.toBase58() || ""),
      tokenMap.get(formValue.outputMint?.toBase58() || "")
    ];
  }, [formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]);
  const [splTokenData, setSplTokenData] = useState<ISplToken[]>([]);

  useEffect(() => {
    new TokenListProvider().resolve().then(tokens => {
      const tokenList = tokens.filterByChainId(CHAIN_ID).getList();
      setTokenMap(
        tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map())
      );
    });
  }, [setTokenMap]);

  const amountInDecimal = useMemo(() => {
    return formValue.amount * 10 ** (inputTokenInfo?.decimals || 1);
  }, [inputTokenInfo, formValue.amount]);

  const { routeMap, allTokenMints, routes, loading, exchange, error, refresh } =
    useJupiter({
      ...formValue,
      amount: amountInDecimal
    });

  const validOutputMints = useMemo(() => {
    return routeMap.get(formValue.inputMint?.toBase58() || "") || allTokenMints;
  }, [routeMap, formValue.inputMint?.toBase58()]);

  // ensure outputMint can be swapable to inputMint
  useEffect(() => {
    if (formValue.inputMint) {
      const possibleOutputs = routeMap.get(formValue.inputMint.toBase58());

      if (
        possibleOutputs &&
        !possibleOutputs?.includes(formValue.outputMint?.toBase58() || "")
      ) {
        setFormValue(val => ({
          ...val,
          outputMint: new PublicKey(possibleOutputs[0])
        }));
      }
    }
  }, [formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]);

  const getSymbolByMint = (mintList: string[]) => {
    return mintList.map(t => {
      let tokenInfo: IToken = {
        mint: "",
        symbol: ""
      };
      tokenInfo["mint"] = t;
      tokenInfo["symbol"] = tokenMap.get(t)?.name || "unknown";
      return tokenInfo;
    });
  };

  const specificTokenOnly = (tokenList: IToken[]): (IToken | undefined)[] => {
    return tokenList.map((t: IToken) => {
      if (
        t.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" ||
        t.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" ||
        t.mint === "So11111111111111111111111111111111111111112" ||
        t.mint === "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" ||
        t.mint === "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"
      ) {
        return t;
      }
    });
  };

  let inputList: IToken[] = specificTokenOnly(
    getSymbolByMint(allTokenMints).sort((a: any, b: any) =>
      a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0
    )
  ).filter(t => t !== undefined) as IToken[];

  let outputList = specificTokenOnly(
    getSymbolByMint(validOutputMints).sort((a: any, b: any) =>
      a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0
    )
  ).filter(t => t !== undefined) as IToken[];

  useEffect(() => {
    if (!wallet.connected) {
      return;
    }
    getSPLTokenData(wallet, connection).then((tokenList: ISplToken[]) => {
      if (tokenList) {
        setSplTokenData(() => tokenList.filter((t: any) => t !== undefined));
      }
    });
    return () => {};
  }, [wallet.connected]);

  return (
    <div style={{ display: "flex" }}>
      <div>
        <SplTokenList splTokenData={splTokenData} />
      </div>
      <div className={style.jupiterFormModal}>
        <div className={style.title}>Jupiter</div>
        <div className={style.selectBlock}>
          <label htmlFor="inputMint">Input token</label>
          <select
            className={style.select}
            id="inputMint"
            name="inputMint"
            value={formValue.inputMint?.toBase58()}
            onChange={e => {
              const pbKey = new PublicKey(e.currentTarget.value);
              if (pbKey) {
                setFormValue(val => ({
                  ...val,
                  inputMint: pbKey
                }));
              }
            }}
          >
            {inputList.map((t: IToken) => {
              return (
                <option key={t.mint} value={t.mint}>
                  {t.symbol}
                </option>
              );
            })}
          </select>
        </div>

        <div className={style.selectBlock}>
          <label htmlFor="outputMint">Output token</label>
          <select
            className={style.select}
            id="outputMint"
            name="outputMint"
            value={formValue.outputMint?.toBase58()}
            onChange={e => {
              const pbKey = new PublicKey(e.currentTarget.value);
              if (pbKey) {
                setFormValue(val => ({
                  ...val,
                  outputMint: pbKey
                }));
              }
            }}
          >
            {outputList.map((t: IToken) => {
              return (
                <option key={t.mint} value={t.mint}>
                  {t.symbol}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor="amount">
            Input Amount ({inputTokenInfo?.symbol})
          </label>
          <div>
            <input
              className={style.input}
              name="amount"
              id="amount"
              value={formValue.amount}
              type="text"
              pattern="[0-9]*"
              onInput={(e: any) => {
                let newValue = Number(e.target?.value || 0);
                newValue = Number.isNaN(newValue) ? 0 : newValue;
                setFormValue(val => ({
                  ...val,
                  amount: Math.max(newValue, 0)
                }));
              }}
            />
          </div>
        </div>
        <button
          className={style.operateBtn}
          type="button"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Loading" : "Refresh rate"}
        </button>

        <div>Total routes: {routes?.length}</div>

        {routes?.[0] &&
          (() => {
            const route = routes[0];
            return (
              <div>
                <div>
                  Best route info :{" "}
                  {route.marketInfos.map(info => info.marketMeta.amm.label)}
                </div>
                <div>
                  Output:{" "}
                  {route.outAmount / 10 ** (outputTokenInfo?.decimals || 1)}{" "}
                  {outputTokenInfo?.symbol}
                </div>
                <FeeInfo route={route} />
              </div>
            );
          })()}

        {error && <div>Error in Jupiter, try changing your input</div>}

        <button
          className={`${style.operateBtn} ${style.swapBtn}`}
          type="button"
          disabled={loading}
          onClick={async () => {
            if (
              !loading &&
              routes?.[0] &&
              wallet.signAllTransactions &&
              wallet.signTransaction &&
              wallet.sendTransaction &&
              wallet.publicKey
            ) {
              await exchange({
                wallet: {
                  sendTransaction: wallet.sendTransaction,
                  publicKey: wallet.publicKey,
                  signAllTransactions: wallet.signAllTransactions,
                  signTransaction: wallet.signTransaction
                },
                route: routes[0],
                confirmationWaiterFactory: async txid => {
                  await connection.confirmTransaction(txid);
                  getSPLTokenData(wallet, connection).then(
                    (tokenList: ISplToken[]) => {
                      if (tokenList) {
                        setSplTokenData(() =>
                          tokenList.filter((t: ISplToken) => t !== undefined)
                        );
                      }
                    }
                  );
                  return await connection.getTransaction(txid, {
                    commitment: "confirmed"
                  });
                }
              });
            }
          }}
        >
          Swap Best Route
        </button>
      </div>
    </div>
  );
};

export default JupiterForm;

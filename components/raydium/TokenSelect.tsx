import { FunctionComponent, useEffect, useState } from "react";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { useWallet } from "@solana/wallet-adapter-react";
import style from "../../styles/swap.module.sass";

const TokenSelect: FunctionComponent<TokenSelectProps> = props => {
  let wallet = useWallet();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const updateAmount = (e: any) => {
    e.preventDefault();

    const amountData: IUpdateAmountData = {
      amount: e.target.value,
      type: props.type
    };
    props.updateAmount(amountData);
  };

  const selectToken = () => {
    props.toggleTokenList(props.type);
  };

  useEffect(() => {
    const updateSelectedTokenBalance = () => {
      console.log(props.tokenData.tokenInfo?.mintAddress)
      let data: ISplToken | undefined = props.splTokenData.find(
        (t: ISplToken) =>
          t.parsedInfo.mint === props.tokenData.tokenInfo?.mintAddress
      );
      console.log(props.splTokenData)
      if (data) {
        setTokenBalance(data.amount);
      } else {
        setTokenBalance(0);
      }
    };
    updateSelectedTokenBalance();
  }, [props.tokenData, props.splTokenData]); 

  const DropDownTokenListBtn: FunctionComponent<dropDownTokenListBtnProps> = selectTokenProps => {
    if (selectTokenProps.tokenData.tokenInfo?.symbol) {
      return (
        <>
          <img
            src={selectTokenProps.tokenData.tokenInfo?.logoURI}
            alt="logo"
            className={style.img}
          />
          <div className={style.coinNameBlock}>
            <span className={style.coinName}>
              {selectTokenProps.tokenData.tokenInfo?.symbol}
            </span>
            <ArrowDownIcon w={5} h={5} />
          </div>
        </>
      );
    }
    return (
      <>
        <span>Select a token</span>
        <ArrowDownIcon w={5} h={5} />
      </>
    );
  };

  return (
    <div className={style.coinSelect}>
      <div className={style.noteText}>
        <div>
          {props.type === "To" ? `${props.type} (Estimate)` : props.type}
        </div>
        <div>
          {wallet.connected && tokenBalance
            ? `Balance: ${tokenBalance.toFixed(4)}`
            : ""}
        </div>
      </div>
      <div className={style.coinAmountRow}>
        {props.type !== "From" ? (
          <div className={style.input}>
            {props.tokenData.amount ? props.tokenData.amount : "-"}
          </div>
        ) : (
          <input
            type="number"
            className={style.input}
            placeholder="0.00"
            onChange={updateAmount}
            disabled={props.type !== "From"}
          />
        )}

        <div className={style.selectTokenBtn} onClick={selectToken}>
          <DropDownTokenListBtn tokenData={props.tokenData} />
        </div>
      </div>
    </div>
  );
};

export default TokenSelect;

import { FunctionComponent } from "react";
import Image from "next/image";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { AccountInfo, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { TokenData } from "./index";
import style from "../../styles/swap.module.sass";

interface TokenSelectProps {
  type: string;
  toggleTokenList: Function;
  tokenData: TokenData;
  updateAmount: Function;
  accountInfo: AccountInfo<Uint8Array>;
  wallet: Object;
};

interface SelectTokenProps {
  propsData: {
    tokenData: TokenData;
  };
};

const TokenSelect: FunctionComponent<TokenSelectProps> = props => {
  let wallet = useWallet();
  const updateAmount = (e: any) => {
    e.preventDefault();

    const amountData = {
      amount: e.target.value,
      type: props.type
    };
    props.updateAmount(amountData);
  };

  const selectToken = () => {
    props.toggleTokenList(props.type);
  };

  const SelectTokenBtn: FunctionComponent<SelectTokenProps> = selectTokenProps => {
    if (selectTokenProps.propsData.tokenData.tokenInfo?.symbol) {
      return (
        <>
          <Image
            src={selectTokenProps.propsData.tokenData.tokenInfo?.logoURI}
            alt="logo"
            className={style.img}
          />
          <div className={style.coinNameBlock}>
            <span className={style.coinName}>
              {selectTokenProps.propsData.tokenData.tokenInfo?.symbol}
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
          {wallet.connected && props.tokenData.tokenInfo?.symbol === "SOL"
            ? `Balance: ${(props?.accountInfo?.lamports > 0
                ? props?.accountInfo?.lamports / LAMPORTS_PER_SOL
                : 0
              ).toFixed(4)}`
            : null}
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
          <SelectTokenBtn propsData={props} />
        </div>
      </div>
    </div>
  );
};

export default TokenSelect;

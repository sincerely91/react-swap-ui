import { FunctionComponent } from "react";
import style from "../../styles/swap.module.sass";
import { TOKENS } from "../../utils/tokens";
import { ISplToken } from "../../utils/web3";

interface ISplTokenProps {
  splTokenData: ISplToken[];
}

interface SplTokenDisplayData {
  symbol: string;
  mint: string;
  pubkey: string;
  amount: number;
}

const SplTokenList: FunctionComponent<ISplTokenProps> = (
  props
): JSX.Element => {
  let tokenList: SplTokenDisplayData[] = [];
  if (props.splTokenData.length === 0) {
    return <></>;
  }

  for (const [_, value] of Object.entries(TOKENS)) {
    let spl: ISplToken | undefined = props.splTokenData.find(
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

  let tokens = tokenList.map((item: SplTokenDisplayData) => {
    return (
      <div key={item.mint} className={style.splTokenItem}>
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
  });

  return (
    <div className={style.splTokenContainer}>
      <div className={style.splTokenListTitle}>Your Tokens</div>
      {tokens}
    </div>
  );
};

export default SplTokenList;

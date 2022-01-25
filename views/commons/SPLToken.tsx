import style from "../../styles/swap.module.sass";
import { TOKENS } from "../../utils/tokens";

const SPLToken = (props: any): JSX.Element => {
  let tokenList: any = [];
  if (props.splTokenData.length === 0) {
    return <></>;
  }

  for (const [_, value] of Object.entries(TOKENS)) {
    let token = props.splTokenData.find(
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

export default SPLToken;

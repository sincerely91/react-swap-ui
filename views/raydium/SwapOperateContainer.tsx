import style from "../../styles/swap.module.sass";
import { ArrowUpDownIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import TokenSelect from "./TokenSelect";
import { Tooltip } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";

const SwapOperateContainer = (props: any) => {
  let wallet = useWallet();
  const SwapBtn = (swapProps: any) => {
    if (wallet.connected) {
      if (
        !swapProps.props.fromData.tokenInfo?.symbol ||
        !swapProps.props.toData.tokenInfo?.symbol
      ) {
        return (
          <button
            className={`${style.operateBtn} ${style.disabledBtn}`}
            disabled
          >
            Select a token
          </button>
        );
      }
      if (
        swapProps.props.fromData.tokenInfo?.symbol &&
        swapProps.props.toData.tokenInfo?.symbol
      ) {
        if (
          !swapProps.props.fromData.amount ||
          !swapProps.props.toData.amount
        ) {
          return (
            <button
              className={`${style.operateBtn} ${style.disabledBtn}`}
              disabled
            >
              Enter an amount
            </button>
          );
        }
      }

      return (
        <button
          className={style.operateBtn}
          onClick={props.sendSwapTransaction}
        >
          Swap
        </button>
      );
    } else {
      return (
        <div className={style.selectWallet}>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>
      );
    }
  };

  const SwapDetailPreview = (props: any) => {
    return (
      <div className={style.slippageRow}>
        <div className={style.slippageTooltipBlock}>
          <div>{props.title}</div>
          <Tooltip
            hasArrow
            label={props.tooltipContent}
            color="white"
            bg="brand.100"
            padding="3"
          >
            <QuestionOutlineIcon
              w={5}
              h={5}
              className={`${style.icon} ${style.icon}`}
            />
          </Tooltip>
        </div>
        <div>{props.value}</div>
      </div>
    );
  };

  const SwapDetailPreviewList = () => {
    return (
      <>
        <SwapDetailPreview
          title="Swapping Through"
          tooltipContent="This venue gave the best price for your trade"
          value={`${props.fromData.tokenInfo.symbol} > ${props.toData.tokenInfo.symbol}`}
        />
      </>
    );
  };

  return (
    <div className={style.swapCard}>
      <div className={style.cardBody}>
        <TokenSelect
          type="From"
          toggleTokenList={props.toggleTokenList}
          tokenData={props.fromData}
          updateAmount={props.updateAmount}
          accountInfo={props.accountInfo}
          wallet={props.wallet}
        />
        <div
          className={`${style.switchIcon} ${style.icon}`}
          onClick={props.switchFromAndTo}
        >
          <ArrowUpDownIcon w={5} h={5} />
        </div>
        <TokenSelect
          type="To"
          toggleTokenList={props.toggleTokenList}
          tokenData={props.toData}
          updateAmount={props.updateAmount}
          accountInfo={props.accountInfo}
          wallet={props.wallet}
        />
        <div className={style.slippageRow}>
          <div className={style.slippageTooltipBlock}>
            <div>Slippage Tolerance </div>
            <Tooltip
              hasArrow
              label="The maximum difference between your estimated price and execution price."
              color="white"
              bg="brand.100"
              padding="3"
            >
              <QuestionOutlineIcon
                w={5}
                h={5}
                className={`${style.icon} ${style.icon}`}
              />
            </Tooltip>
          </div>
          <div>{props.slippageValue}%</div>
        </div>
        {props.fromData.amount > 0 &&
        props.fromData.tokenInfo.symbol &&
        props.toData.amount > 0 &&
        props.toData.tokenInfo.symbol ? (
          <SwapDetailPreviewList />
        ) : (
          ""
        )}
        <SwapBtn props={props} />
      </div>
    </div>
  );
};

export default SwapOperateContainer;

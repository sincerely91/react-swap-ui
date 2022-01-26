import style from "../../styles/swap.module.sass";
import {
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow
} from "@chakra-ui/react";
import { SettingsIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useState, useEffect, FunctionComponent } from "react";
import { TokenData, ITokenInfo } from ".";

interface ITitleProps {
  toggleSlippageSetting: Function;
  fromData: TokenData;
  toData: TokenData;
  updateSwapOutAmount: Function;
}

interface IAddressInfoProps {
  type: string;
}

const TitleRow: FunctionComponent<ITitleProps> = (props): JSX.Element => {
  const [second, setSecond] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    let id = setInterval(() => {
      setSecond(second + 1);
      setPercentage((second * 100) / 60);
      if (second === 60) {
        setSecond(0);
        props.updateSwapOutAmount();
      }
    }, 1000);
    return () => clearInterval(id);
  });

  const AddressInfo: FunctionComponent<IAddressInfoProps> = (
    addressProps
  ): JSX.Element => {
    let fromToData = {} as ITokenInfo;
    if (addressProps.type === "From") {
      fromToData = props.fromData.tokenInfo;
    } else {
      fromToData = props.toData.tokenInfo;
    }

    return (
      <>
        <span className={style.symbol}>{fromToData?.symbol}</span>
        <span className={style.address}>
          <span>{fromToData?.mintAddress.substring(0, 14)}</span>
          <span>{fromToData?.mintAddress ? "..." : ""}</span>
          {fromToData?.mintAddress.substr(-14)}
        </span>
      </>
    );
  };

  return (
    <div className={style.titleContainer}>
      <div className={style.title}>Swap</div>
      <div className={style.iconContainer}>
        <Tooltip
          hasArrow
          label={`Displayed data will auto-refresh after ${
            60 - second
          } seconds. Click this circle to update manually.`}
          color="white"
          bg="brand.100"
          padding="3"
        >
          <svg
            viewBox="0 0 36 36"
            className={`${style.percentageCircle} ${style.icon}`}
          >
            <path
              className={style.circleBg}
              d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgb(20, 120, 227)"
              strokeWidth="3"
              // @ts-ignore
              strokeDasharray={[percentage, 100]}
            />
          </svg>
        </Tooltip>
        <Popover trigger="hover">
          <PopoverTrigger>
            <div className={style.icon}>
              <InfoOutlineIcon w={18} h={18} />
            </div>
          </PopoverTrigger>
          <PopoverContent
            color="white"
            bg="brand.100"
            border="none"
            w="auto"
            className={style.popover}
          >
            <PopoverArrow bg="brand.100" className={style.popover} />
            <PopoverBody>
              <div className={style.selectTokenAddressTitle}>
                Program Addresses (DO NOT DEPOSIT)
              </div>
              <div className={style.selectTokenAddress}>
                {props.fromData.tokenInfo?.symbol ? (
                  <AddressInfo type="From" />
                ) : (
                  ""
                )}
              </div>
              <div className={style.selectTokenAddress}>
                {props.toData.tokenInfo?.symbol ? (
                  <AddressInfo type="To" />
                ) : (
                  ""
                )}
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <div
          className={style.icon}
          onClick={() => props.toggleSlippageSetting()}
        >
          <SettingsIcon w={18} h={18} />
        </div>
        {/* <Tooltip
          hasArrow
          label="Search for a pool"
          color="white"
          bg="brand.100"
          padding="3"
        >
          <div className={style.icon}>
            <SearchIcon w={18} h={18} />
          </div>
        </Tooltip> */}
      </div>
    </div>
  );
};

export default TitleRow;

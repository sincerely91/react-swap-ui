import style from "../../styles/_swap.module.sass";
import { CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

const SlippageSetting = (props: any) => {
  // slippage list
  const rate = [0.1, 0.5, 1];
  const [warningText, setWarningText] = useState("");

  const setSlippageBtn = (item: any) => {
    props.getSlippageValue(item);
  };

  useEffect(() => {
    Options();

    if (props.slippageValue < 0 || props.slippageValue === "") {
      setWarningText("Please enter a valid slippage percentage");
    } else if (props.slippageValue < 1) {
      setWarningText("Your transaction may fail");
    } else {
      setWarningText("");
    }
  }, [props.slippageValue]);

  const Options = (): JSX.Element => {
    return (
      <>
        {rate.map(item => {
          return (
            <button
              className={`${style.optionBtn} ${
                item === props.slippageValue
                  ? style.selectedSlippageRateBtn
                  : ""
              }`}
              key={item}
              onClick={() => setSlippageBtn(item)}
            >
              {item}%
            </button>
          );
        })}
      </>
    );
  };

  const updateInputRate = (e: any) => {
    props.getSlippageValue(e.target.value);
  };

  const close = () => {
    if (props.slippageValue < 0 || props.slippageValue === "") {
      return;
    }
    props.toggleSlippageSetting();
  };

  if (!props.showSlippageSetting) {
    return null;
  }

  return (
    <div className={style.slippageSettingComponent}>
      <div className={style.slippageSettingContainer}>
        <div className={style.header}>
          <div>Setting</div>
          <div className={style.closeIcon} onClick={close}>
            <CloseIcon w={5} h={5} />
          </div>
        </div>
        <div className={style.settingSelectBlock}>
          <div className={style.title}>Slippage tolerance</div>
          <div className={style.optionsBlock}>
            <Options />
            <button className={`${style.optionBtn} ${style.inputBtn}`}>
              <input
                type="number"
                placeholder="0%"
                className={style.input}
                // ref={rateRef}
                value={props.slippageValue}
                onChange={updateInputRate}
              />
              %
            </button>
          </div>
          <div className={style.warning}>{warningText}</div>
        </div>
      </div>
    </div>
  );
};

export default SlippageSetting;

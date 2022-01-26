import { useState, useEffect, FunctionComponent } from "react";
import { CloseIcon } from "@chakra-ui/icons";
import style from "../../styles/swap.module.sass";

interface SlippageSettingProps {
  showSlippageSetting: boolean;
  toggleSlippageSetting: Function;
  getSlippageValue: Function;
  slippageValue: number;
}

const SlippageSetting: FunctionComponent<SlippageSettingProps> = props => {
  const rate = [0.1, 0.5, 1];
  const [warningText, setWarningText] = useState("");

  const setSlippageBtn = (item: number) => {
    props.getSlippageValue(item);
  };

  useEffect(() => {
    Options();

    if (props.slippageValue < 0) {
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

  const updateInputRate = (e: React.FormEvent<HTMLInputElement>) => {
    props.getSlippageValue(e.currentTarget.value);
  };

  const close = () => {
    if (props.slippageValue < 0) {
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

import style from "../../styles/swap.module.sass";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";

const Notify = (props: any) => {
  return (
    <Alert status={props.message.status} className={style.notifyContainer}>
      <div className={style.notifyTitleRow}>
        <AlertIcon boxSize="2rem" />
        <AlertTitle className={style.title}>{props.message.title}</AlertTitle>
      </div>
      <AlertDescription className={style.notifyDescription}>
        {props.message.description}
      </AlertDescription>
    </Alert>
  );
};

export default Notify;

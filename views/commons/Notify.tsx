import { FunctionComponent } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertStatus
} from "@chakra-ui/react";
import style from "../../styles/swap.module.sass";

interface NotifyProps {
  message: {
    status: AlertStatus;
    title: string;
    description: string;
  };
};

const Notify: FunctionComponent<NotifyProps> = props => {
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

import { FunctionComponent } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertStatus
} from "@chakra-ui/react";
import style from "../../styles/swap.module.sass";

export interface INotify {
  status: AlertStatus;
  title: string;
  description: string;
  link?: string;
}
interface NotifyProps {
  message: {
    status: AlertStatus;
    title: string;
    description: string;
    link?: string;
  };
}

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
      {props.message.link ? (
        <a
          href={props.message.link}
          style={{ color: "#fbae21", textDecoration: "underline" }}
        >
          Check Explorer
        </a>
      ) : (
        ""
      )}
    </Alert>
  );
};

export default Notify;

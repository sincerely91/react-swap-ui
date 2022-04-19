import { FunctionComponent } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import style from "../../styles/common.module.sass";

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

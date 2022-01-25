import { FunctionComponent } from "react";
import Jupiter from "../views/jupiter/JupiterProvider";
import JupiterForm from "../views/jupiter/JupiterForm";

const JupiterPage: FunctionComponent = () => {
  return (
    <>
      <Jupiter>
        <JupiterForm />
      </Jupiter>
    </>
  );
};

export default JupiterPage;

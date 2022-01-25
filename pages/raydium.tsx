import { FunctionComponent } from "react";
import Swap from "../views/raydium/index";
import { ChakraProvider } from "@chakra-ui/react";

const RaydiumPage: FunctionComponent = () => {
  return (
    <div>
      <ChakraProvider>
        <Swap />
      </ChakraProvider>
    </div>
  );
};

export default RaydiumPage;

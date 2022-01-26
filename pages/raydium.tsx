import { FunctionComponent } from "react";
import Swap from "../views/raydium/index";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../chakra/style";

const RaydiumPage: FunctionComponent = () => {
  return (
    <div>
      <ChakraProvider theme={theme}>
        <Swap />
      </ChakraProvider>
    </div>
  );
};

export default RaydiumPage;

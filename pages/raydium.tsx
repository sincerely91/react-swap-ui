import Swap from "../views/raydium/index";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../chakra/style";

const RaydiumPage = () => {
  return (
    <div>
      <ChakraProvider theme={theme}>
        <Swap />
      </ChakraProvider>
    </div>
  );
};

export default RaydiumPage;

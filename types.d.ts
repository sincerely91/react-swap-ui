import { WalletContextState } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { AlertStatus } from "@chakra-ui/react";
import { SetStateAction, Dispatch} from "react"

declare global {

    // Common Components
    interface INotify {
        status: AlertStatus;
        title: string;
        description: string;
        link?: string;
    }

    type LoadingType = {    
        msg: string,
        size?: "xl" | "xs" | "sm" | "md" | "lg",
        thickness?: number,                         // uint ex: 3 (in pixel)
        speed?: number,                             // floating point ex: 0.65s (in second)
        emptyColor?: string,                        // ex: gray.200 (see chakra doc)
        color?: string,                             // ex: blue.500 (see chakra doc)
    }

    // Raydium Components
    interface IUpdateAmountData {
        type: string;
        amount: number;
    }

    interface ITokenInfo {
        symbol: string;
        mintAddress: string;
        logoURI: string;
    }
    interface TokenData {
        amount: number | null;
        tokenInfo: ITokenInfo;
    }

    interface IUpdateAmountData {
        type: string;
        amount: number;
    }


    // SPL token

    interface SplTokenDisplayData {
        symbol: string;
        mint: string;
        pubkey: string;
        amount: number;
    }

    interface ISplToken {
        pubkey: string;
        parsedInfo: any;
        amount: number;
    }

    // Components props

    type LoadingProps = {
        data: LoadingType
    }

    interface NotifyProps {
        message: INotify;
    }

    interface ISplTokenProps {
        splTokenData: ISplToken[];
    }

    interface TokenListProps {
        showTokenList: boolean;
        toggleTokenList: (type: "From" | "To" | undefined) => void;
        getTokenInfo: Function;
    }

    interface TokenSelectProps {
        type: string;
        toggleTokenList: Function;
        tokenData: TokenData;
        updateAmount: Function;
        wallet: Object;
        splTokenData: ISplToken[];
    }

    interface dropDownTokenListBtnProps {
        tokenData: TokenData;
    }

    interface SwapOperateContainerProps {
        toggleTokenList: Function;
        fromData: TokenData;
        toData: TokenData;
        updateAmount: Function;
        switchFromAndTo: (event?: React.MouseEvent<HTMLDivElement>) => void;
        slippageValue: number;
        sendSwapTransaction: (event?: React.MouseEvent<HTMLButtonElement>) => void;
        splTokenData: ISplToken[];
    }
    
    interface SwapDetailProps {
        title: string;
        tooltipContent: string;
        value: string;
    }


    // Context Types

    type DappContextType = {
        splTokens: ISplToken[] | undefined,
        connection: Connection,
        setNotify: Dispatch<SetStateAction<INotify | null>>| null,
        setLoading: Dispatch<SetStateAction<LoadingType | null>>| null
    }
}
export {}
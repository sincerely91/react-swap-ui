import { Spinner } from "@chakra-ui/react"
import style from "../../styles/common.module.sass";

function Loading(props: LoadingProps): JSX.Element {
    const {size, msg, thickness, speed, emptyColor, color} = props.data
    return <>
    <div className={style.loadingContainer}>
        <div>{msg}</div>
        <Spinner 
            size={size}
            thickness={thickness ? `${thickness}px` : "4px"}
            speed={speed ? `${speed}s` : "0.65s"}
            emptyColor={emptyColor ? emptyColor : "gray.200"}
            color={color ? color : "blue.500"}
            />
    </div>
    
    </>
}
export default Loading
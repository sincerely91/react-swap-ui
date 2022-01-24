//@ts-ignore
import { struct } from "buffer-layout";
import { publicKey, u128, u64 } from "@project-serum/borsh";
import { PublicKey } from "@solana/web3.js";
import { LP_TOKENS } from "./tokens";
import { commitment, getMultipleAccounts } from "./web3";
import { MINT_LAYOUT } from "./layouts";

export const AMM_INFO_LAYOUT = struct([
  u64("status"),
  u64("nonce"),
  u64("orderNum"),
  u64("depth"),
  u64("coinDecimals"),
  u64("pcDecimals"),
  u64("state"),
  u64("resetFlag"),
  u64("fee"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("pnlRatio"),
  u64("amountWaveRatio"),
  u64("coinLotSize"),
  u64("pcLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("needTakePnlCoin"),
  u64("needTakePnlPc"),
  u64("totalPnlX"),
  u64("totalPnlY"),
  u64("systemDecimalsValue"),
  publicKey("poolCoinTokenAccount"),
  publicKey("poolPcTokenAccount"),
  publicKey("coinMintAddress"),
  publicKey("pcMintAddress"),
  publicKey("lpMintAddress"),
  publicKey("ammOpenOrders"),
  publicKey("serumMarket"),
  publicKey("serumProgramId"),
  publicKey("ammTargetOrders"),
  publicKey("ammQuantities"),
  publicKey("poolWithdrawQueue"),
  publicKey("poolTempLpTokenAccount"),
  publicKey("ammOwner"),
  publicKey("pnlOwner")
]);

export const AMM_INFO_LAYOUT_V3 = struct([
  u64("status"),
  u64("nonce"),
  u64("orderNum"),
  u64("depth"),
  u64("coinDecimals"),
  u64("pcDecimals"),
  u64("state"),
  u64("resetFlag"),
  u64("fee"),
  u64("min_separate"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("pnlRatio"),
  u64("amountWaveRatio"),
  u64("coinLotSize"),
  u64("pcLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("needTakePnlCoin"),
  u64("needTakePnlPc"),
  u64("totalPnlX"),
  u64("totalPnlY"),
  u64("poolTotalDepositPc"),
  u64("poolTotalDepositCoin"),
  u64("systemDecimalsValue"),
  publicKey("poolCoinTokenAccount"),
  publicKey("poolPcTokenAccount"),
  publicKey("coinMintAddress"),
  publicKey("pcMintAddress"),
  publicKey("lpMintAddress"),
  publicKey("ammOpenOrders"),
  publicKey("serumMarket"),
  publicKey("serumProgramId"),
  publicKey("ammTargetOrders"),
  publicKey("ammQuantities"),
  publicKey("poolWithdrawQueue"),
  publicKey("poolTempLpTokenAccount"),
  publicKey("ammOwner"),
  publicKey("pnlOwner"),
  publicKey("srmTokenAccount")
]);

export const AMM_INFO_LAYOUT_V4 = struct([
  u64("status"),
  u64("nonce"),
  u64("orderNum"),
  u64("depth"),
  u64("coinDecimals"),
  u64("pcDecimals"),
  u64("state"),
  u64("resetFlag"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("amountWaveRatio"),
  u64("coinLotSize"),
  u64("pcLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("systemDecimalsValue"),
  // Fees
  u64("minSeparateNumerator"),
  u64("minSeparateDenominator"),
  u64("tradeFeeNumerator"),
  u64("tradeFeeDenominator"),
  u64("pnlNumerator"),
  u64("pnlDenominator"),
  u64("swapFeeNumerator"),
  u64("swapFeeDenominator"),
  // OutPutData
  u64("needTakePnlCoin"),
  u64("needTakePnlPc"),
  u64("totalPnlPc"),
  u64("totalPnlCoin"),

  u64("poolOpenTime"),
  u64("punishPcAmount"),
  u64("punishCoinAmount"),
  u64("orderbookToInitTime"),

  u128("swapCoinInAmount"),
  u128("swapPcOutAmount"),
  u64("swapCoin2PcFee"),
  u128("swapPcInAmount"),
  u128("swapCoinOutAmount"),
  u64("swapPc2CoinFee"),

  publicKey("poolCoinTokenAccount"),
  publicKey("poolPcTokenAccount"),
  publicKey("coinMintAddress"),
  publicKey("pcMintAddress"),
  publicKey("lpMintAddress"),
  publicKey("ammOpenOrders"),
  publicKey("serumMarket"),
  publicKey("serumProgramId"),
  publicKey("ammTargetOrders"),
  publicKey("poolWithdrawQueue"),
  publicKey("poolTempLpTokenAccount"),
  publicKey("ammOwner"),
  publicKey("pnlOwner")
]);

export const AMM_INFO_LAYOUT_STABLE = struct([
  u64("status"),
  publicKey("own_address"),
  u64("nonce"),
  u64("orderNum"),
  u64("depth"),
  u64("coinDecimals"),
  u64("pcDecimals"),
  u64("state"),
  u64("resetFlag"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("amountWaveRatio"),
  u64("coinLotSize"),
  u64("pcLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("systemDecimalsValue"),

  u64("ammMaxPrice"),
  u64("ammMiddlePrice"),
  u64("ammPriceMultiplier"),

  // Fees
  u64("minSeparateNumerator"),
  u64("minSeparateDenominator"),
  u64("tradeFeeNumerator"),
  u64("tradeFeeDenominator"),
  u64("pnlNumerator"),
  u64("pnlDenominator"),
  u64("swapFeeNumerator"),
  u64("swapFeeDenominator"),
  // OutPutData
  u64("needTakePnlCoin"),
  u64("needTakePnlPc"),
  u64("totalPnlPc"),
  u64("totalPnlCoin"),
  u128("poolTotalDepositPc"),
  u128("poolTotalDepositCoin"),
  u128("swapCoinInAmount"),
  u128("swapPcOutAmount"),
  u128("swapPcInAmount"),
  u128("swapCoinOutAmount"),
  u64("swapPcFee"),
  u64("swapCoinFee"),

  publicKey("poolCoinTokenAccount"),
  publicKey("poolPcTokenAccount"),
  publicKey("coinMintAddress"),
  publicKey("pcMintAddress"),
  publicKey("lpMintAddress"),
  publicKey("ammOpenOrders"),
  publicKey("serumMarket"),
  publicKey("serumProgramId"),
  publicKey("ammTargetOrders"),
  publicKey("poolWithdrawQueue"),
  publicKey("poolTempLpTokenAccount"),
  publicKey("ammOwner"),
  publicKey("pnlOwner"),

  u128("currentK"),
  u128("padding1"),
  publicKey("padding2")
]);

export async function getLpMintListDecimals(
  conn: any,
  mintAddressInfos: string[]
): Promise<{ [name: string]: number }> {
  const reLpInfoDict: { [name: string]: number } = {};
  const mintList = [] as PublicKey[];
  mintAddressInfos.forEach(item => {
    let lpInfo = Object.values(LP_TOKENS).find(
      itemLpToken => itemLpToken.mintAddress === item
    );
    if (!lpInfo) {
      mintList.push(new PublicKey(item));
      lpInfo = {
        decimals: null
      };
    }
    reLpInfoDict[item] = lpInfo.decimals;
  });
  const mintAll = await getMultipleAccounts(conn, mintList, commitment);
  for (let mintIndex = 0; mintIndex < mintAll.length; mintIndex += 1) {
    const itemMint = mintAll[mintIndex];
    if (itemMint) {
      const mintLayoutData = MINT_LAYOUT.decode(
        Buffer.from(itemMint.account.data)
      );
      reLpInfoDict[mintList[mintIndex].toString()] = mintLayoutData.decimals;
    }
  }
  const reInfo: { [name: string]: number } = {};
  for (const key of Object.keys(reLpInfoDict)) {
    if (reLpInfoDict[key] !== null) {
      reInfo[key] = reLpInfoDict[key];
    }
  }
  return reInfo;
}

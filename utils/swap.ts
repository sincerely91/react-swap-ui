import { Buffer } from "buffer";
import { closeAccount } from "@project-serum/serum/lib/token-instructions";
import { OpenOrders } from "@project-serum/serum";
// import { _OPEN_ORDERS_LAYOUT_V2} from '@project-serum/serum/lib/market';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  AccountInfo,
  Keypair
} from "@solana/web3.js";
// @ts-ignore
import { nu64, struct, u8 } from "buffer-layout";

// eslint-disable-next-line
import { TokenAmount } from "./safe-math";
import {
  createAssociatedTokenAccountIfNotExist,
  createTokenAccountIfNotExist,
  sendTransaction,
  getMultipleAccounts,
  getFilteredProgramAccountsAmmOrMarketCache,
  createAmmAuthority
} from "./web3";
import { TOKEN_PROGRAM_ID } from "./ids";
import { getBigNumber, ACCOUNT_LAYOUT, MINT_LAYOUT } from "./layouts";

// eslint-disable-next-line
import {
  getTokenByMintAddress,
  NATIVE_SOL,
  TOKENS,
  // TokenInfo,
  LP_TOKENS
} from "./tokens";
// import { getAddressForWhat, LIQUIDITY_POOLS, LiquidityPoolInfo } from "./pools";
import { getAddressForWhat, LIQUIDITY_POOLS} from "./pools";
import {
  AMM_INFO_LAYOUT,
  AMM_INFO_LAYOUT_STABLE,
  AMM_INFO_LAYOUT_V3,
  AMM_INFO_LAYOUT_V4,
  getLpMintListDecimals
} from "./liquidity";
import { LIQUIDITY_POOL_PROGRAM_ID_V4, SERUM_PROGRAM_ID_V3 } from "./ids";
import { MARKET_STATE_LAYOUT_V2 } from "@project-serum/serum/lib/market";

export function swapInstruction(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  ammTargetOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  // serum
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,
  // user
  userSourceTokenAccount: PublicKey,
  userDestTokenAccount: PublicKey,
  userOwner: PublicKey,

  amountIn: number,
  minAmountOut: number
): TransactionInstruction {
  const dataLayout = struct([
    u8("instruction"),
    nu64("amountIn"),
    nu64("minAmountOut")
  ]);

  const keys = [
    // spl token
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    // amm
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ];

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 9,
      amountIn,
      minAmountOut
    },
    data
  );

  return new TransactionInstruction({
    keys,
    programId,
    data
  });
}

export async function swap(
  connection: Connection,
  wallet: any,
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  fromTokenAccount: string,
  toTokenAccount: string,
  aIn: string,
  aOut: string,
  wsolAddress: string
) {
  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const owner = wallet.publicKey;

  const from = getTokenByMintAddress(fromCoinMint);
  const to = getTokenByMintAddress(toCoinMint);
  if (!from || !to) {
    throw new Error("Miss token info");
  }

  const amountIn = new TokenAmount(aIn, from.decimals, false);
  const amountOut = new TokenAmount(aOut, to.decimals, false);

  if (fromCoinMint === NATIVE_SOL.mintAddress && wsolAddress) {
    transaction.add(
      closeAccount({
        source: new PublicKey(wsolAddress),
        destination: owner,
        owner
      })
    );
  }

  let fromMint = fromCoinMint;
  let toMint = toCoinMint;

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress;
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress;
  }

  let wrappedSolAccount: PublicKey | null = null;
  let wrappedSolAccount2: PublicKey | null = null;
  let newFromTokenAccount = PublicKey.default;
  let newToTokenAccount = PublicKey.default;

  if (fromCoinMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      getBigNumber(amountIn.wei) + 1e7,
      transaction,
      signers
    );
  } else {
    newFromTokenAccount = await createAssociatedTokenAccountIfNotExist(
      fromTokenAccount,
      owner,
      fromMint,
      transaction
    );
  }

  if (toCoinMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount2 = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount2,
      owner,
      TOKENS.WSOL.mintAddress,
      1e7,
      transaction,
      signers
    );
  } else {
    newToTokenAccount = await createAssociatedTokenAccountIfNotExist(
      toTokenAccount,
      owner,
      toMint,
      transaction
    );
  }

  transaction.add(
    swapInstruction(
      new PublicKey(poolInfo.programId),
      new PublicKey(poolInfo.ammId),
      new PublicKey(poolInfo.ammAuthority),
      new PublicKey(poolInfo.ammOpenOrders),
      new PublicKey(poolInfo.ammTargetOrders),
      new PublicKey(poolInfo.poolCoinTokenAccount),
      new PublicKey(poolInfo.poolPcTokenAccount),
      new PublicKey(poolInfo.serumProgramId),
      new PublicKey(poolInfo.serumMarket),
      new PublicKey(poolInfo.serumBids),
      new PublicKey(poolInfo.serumAsks),
      new PublicKey(poolInfo.serumEventQueue),
      new PublicKey(poolInfo.serumCoinVaultAccount),
      new PublicKey(poolInfo.serumPcVaultAccount),
      new PublicKey(poolInfo.serumVaultSigner),
      wrappedSolAccount ?? newFromTokenAccount,
      wrappedSolAccount2 ?? newToTokenAccount,
      owner,
      Math.floor(getBigNumber(amountIn.toWei())),
      Math.floor(getBigNumber(amountOut.toWei()))
    )
  );

  if (wrappedSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount,
        destination: owner,
        owner
      })
    );
  }
  if (wrappedSolAccount2) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount2,
        destination: owner,
        owner
      })
    );
  }

  return await sendTransaction(connection, wallet, transaction, signers);
}

export function getSwapOutAmount(
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  amount: string,
  slippage: number
) {
  const { coin, pc, fees } = poolInfo;
  const { swapFeeNumerator, swapFeeDenominator } = fees;

  if (fromCoinMint === TOKENS.WSOL.mintAddress)
    fromCoinMint = NATIVE_SOL.mintAddress;
  if (toCoinMint === TOKENS.WSOL.mintAddress)
    toCoinMint = NATIVE_SOL.mintAddress;

  if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
    // coin2pc
    const fromAmount = new TokenAmount(amount, coin.decimals, false);
    const fromAmountWithFee = fromAmount.wei
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator);
    const denominator = coin.balance.wei.plus(fromAmountWithFee);
    const amountOut = pc.balance.wei
      .multipliedBy(fromAmountWithFee)
      .dividedBy(denominator);
    const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

    const outBalance = pc.balance.wei.minus(amountOut);
    const beforePrice = new TokenAmount(
      parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const afterPrice = new TokenAmount(
      parseFloat(new TokenAmount(outBalance, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(denominator, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const priceImpact =
      Math.abs(
        (parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) /
          parseFloat(beforePrice.fixed())
      ) * 100;

    return {
      amountIn: fromAmount,
      amountOut: new TokenAmount(amountOut, pc.decimals),
      amountOutWithSlippage: new TokenAmount(
        amountOutWithSlippage,
        pc.decimals
      ),
      priceImpact
    };
  } else {
    // pc2coin
    const fromAmount = new TokenAmount(amount, pc.decimals, false);
    const fromAmountWithFee = fromAmount.wei
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator);

    const denominator = pc.balance.wei.plus(fromAmountWithFee);
    const amountOut = coin.balance.wei
      .multipliedBy(fromAmountWithFee)
      .dividedBy(denominator);
    const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

    const outBalance = coin.balance.wei.minus(amountOut);

    const beforePrice = new TokenAmount(
      parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const afterPrice = new TokenAmount(
      parseFloat(new TokenAmount(denominator, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(outBalance, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const priceImpact =
      Math.abs(
        (parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) /
          parseFloat(beforePrice.fixed())
      ) * 100;
    return {
      amountIn: fromAmount,
      amountOut: new TokenAmount(amountOut, coin.decimals),
      amountOutWithSlippage: new TokenAmount(
        amountOutWithSlippage,
        coin.decimals
      ),
      priceImpact
    };
  }
}

export async function setupPools(conn: Connection) {
  let ammAll: {
    publicKey: PublicKey;
    accountInfo: AccountInfo<Buffer>;
  }[] = [];
  let marketAll: {
    publicKey: PublicKey;
    accountInfo: AccountInfo<Buffer>;
  }[] = [];

  await Promise.all([
    await (async () => {
      ammAll = await getFilteredProgramAccountsAmmOrMarketCache(
        "amm",
        conn,
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        [
          {
            dataSize: AMM_INFO_LAYOUT_V4.span
          }
        ]
      );
    })(),
    await (async () => {
      marketAll = await getFilteredProgramAccountsAmmOrMarketCache(
        "market",
        conn,
        new PublicKey(SERUM_PROGRAM_ID_V3),
        [
          {
            dataSize: MARKET_STATE_LAYOUT_V2.span
          }
        ]
      );
    })()
  ]);
  const marketToLayout: { [name: string]: any } = {};
  marketAll.forEach(item => {
    marketToLayout[item.publicKey.toString()] = MARKET_STATE_LAYOUT_V2.decode(
      item.accountInfo.data
    );
  });
  const lpMintAddressList: string[] = [];
  ammAll.forEach(item => {
    const ammLayout = AMM_INFO_LAYOUT_V4.decode(
      Buffer.from(item.accountInfo.data)
    );
    console.log("\n",ammLayout.serumMarket.toString())                                    // Serum Dex Program v3 
    console.log(ammLayout.coinMintAddress.toString())                                     // coin Mint Address
    console.log(ammLayout.pcMintAddress.toString())                                       // Pair Coin Mint Address 
    console.log(ammLayout.lpMintAddress.toString(), "\n")                                 // LP Coin Mint Address
    
    if (
      ammLayout.pcMintAddress.toString() === ammLayout.serumMarket.toString() ||          /** How could the pair coin mint be = serum dex program?? */
      ammLayout.lpMintAddress.toString() === "11111111111111111111111111111111"           /** How could the lp coin mint be = system program?? */
    ) {
      return;
    }
    lpMintAddressList.push(ammLayout.lpMintAddress.toString());
  });
  const lpMintListDecimls = await getLpMintListDecimals(
    conn,
    lpMintAddressList
  );
  const tokenMintData: { [mintAddress: string]: TokenInfo } = {};
  for (const itemToken of Object.values(TOKENS)) {
    tokenMintData[itemToken.mintAddress] = itemToken;
  }
                                                                                                /**@TODO combine with prev ammAll.forEach section */
  for (let indexAmmInfo = 0; indexAmmInfo < ammAll.length; indexAmmInfo += 1) {
    const ammInfo = AMM_INFO_LAYOUT_V4.decode(
      Buffer.from(ammAll[indexAmmInfo].accountInfo.data)
    );
    if (
      !Object.keys(lpMintListDecimls).includes(
        ammInfo.lpMintAddress.toString()
      ) ||
      ammInfo.pcMintAddress.toString() === ammInfo.serumMarket.toString() ||
      ammInfo.lpMintAddress.toString() === "11111111111111111111111111111111" ||
      !Object.keys(marketToLayout).includes(ammInfo.serumMarket.toString())
    ) {
      continue;
    }
    const fromCoin =
      ammInfo.coinMintAddress.toString() === TOKENS.WSOL.mintAddress
        ? NATIVE_SOL.mintAddress
        : ammInfo.coinMintAddress.toString();
    const toCoin =
      ammInfo.pcMintAddress.toString() === TOKENS.WSOL.mintAddress
        ? NATIVE_SOL.mintAddress
        : ammInfo.pcMintAddress.toString();
    let coin = tokenMintData[fromCoin];
    if (!coin && fromCoin !== NATIVE_SOL.mintAddress) {
      TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`] = {
        symbol: "unknown",
        name: "unknown",
        mintAddress: ammInfo.coinMintAddress.toString(),
        decimals: getBigNumber(ammInfo.coinDecimals),
        cache: true,
        tags: []
      };
      coin = TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`];
      tokenMintData[ammInfo.coinMintAddress.toString()] = coin;
    } else if (fromCoin === NATIVE_SOL.mintAddress) {
      coin = NATIVE_SOL;
    }
    if (!coin.tags.includes("unofficial")) {
      coin.tags.push("unofficial");
    }

    let pc = tokenMintData[toCoin];
    if (!pc && toCoin !== NATIVE_SOL.mintAddress) {
      TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`] = {
        symbol: "unknown",
        name: "unknown",
        mintAddress: ammInfo.pcMintAddress.toString(),
        decimals: getBigNumber(ammInfo.pcDecimals),
        cache: true,
        tags: []
      };
      pc = TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`];
      tokenMintData[ammInfo.pcMintAddress.toString()] = pc;
    } else if (toCoin === NATIVE_SOL.mintAddress) {
      pc = NATIVE_SOL;
    }
    if (!pc.tags.includes("unofficial")) {
      pc.tags.push("unofficial");
    }

    if (coin.mintAddress === TOKENS.WSOL.mintAddress) {
      coin.symbol = "SOL";
      coin.name = "SOL";
      coin.mintAddress = "11111111111111111111111111111111";
    }
    if (pc.mintAddress === TOKENS.WSOL.mintAddress) {
      pc.symbol = "SOL";
      pc.name = "SOL";
      pc.mintAddress = "11111111111111111111111111111111";
    }
    const lp = Object.values(LP_TOKENS).find(
      item => item.mintAddress === ammInfo.lpMintAddress
    ) ?? {
      symbol: `${coin.symbol}-${pc.symbol}`,
      name: `${coin.symbol}-${pc.symbol}`,
      coin,
      pc,
      mintAddress: ammInfo.lpMintAddress.toString(),
      decimals: lpMintListDecimls[ammInfo.lpMintAddress]
    };

    const { publicKey } = await createAmmAuthority(
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
    );

    const market = marketToLayout[ammInfo.serumMarket];

    const serumVaultSigner = await PublicKey.createProgramAddress(
      [
        ammInfo.serumMarket.toBuffer(),
        market.vaultSignerNonce.toArrayLike(Buffer, "le", 8)
      ],
      new PublicKey(SERUM_PROGRAM_ID_V3)
    );

    const itemLiquidity: LiquidityPoolInfo = {
      name: `${coin.symbol}-${pc.symbol}`,
      coin,
      pc,
      lp,
      version: 4,
      programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
      ammId: ammAll[indexAmmInfo].publicKey.toString(),
      ammAuthority: publicKey.toString(),
      ammOpenOrders: ammInfo.ammOpenOrders.toString(),
      ammTargetOrders: ammInfo.ammTargetOrders.toString(),
      ammQuantities: NATIVE_SOL.mintAddress,
      poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
      poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
      poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
      poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
      serumProgramId: SERUM_PROGRAM_ID_V3,
      serumMarket: ammInfo.serumMarket.toString(),
      serumBids: market.bids.toString(),
      serumAsks: market.asks.toString(),
      serumEventQueue: market.eventQueue.toString(),
      serumCoinVaultAccount: market.baseVault.toString(),
      serumPcVaultAccount: market.quoteVault.toString(),
      serumVaultSigner: serumVaultSigner.toString(),
      official: false
    };
    if (!LIQUIDITY_POOLS.find(item => item.ammId === itemLiquidity.ammId)) {
      LIQUIDITY_POOLS.push(itemLiquidity);
    } else {
      for (
        let itemIndex = 0;
        itemIndex < LIQUIDITY_POOLS.length;
        itemIndex += 1
      ) {
        if (
          LIQUIDITY_POOLS[itemIndex].ammId === itemLiquidity.ammId &&
          LIQUIDITY_POOLS[itemIndex].name !== itemLiquidity.name &&
          !LIQUIDITY_POOLS[itemIndex].official
        ) {
          LIQUIDITY_POOLS[itemIndex] = itemLiquidity;
        }
      }
    }
  }

  const liquidityPools = {} as any;
  const publicKeys = [] as any;

  LIQUIDITY_POOLS.forEach(pool => {
    const {
      poolCoinTokenAccount,
      poolPcTokenAccount,
      ammOpenOrders,
      ammId,
      coin,
      pc,
      lp
    } = pool;

    publicKeys.push(
      new PublicKey(poolCoinTokenAccount),
      new PublicKey(poolPcTokenAccount),
      new PublicKey(ammOpenOrders),
      new PublicKey(ammId),
      new PublicKey(lp.mintAddress)
    );

    const poolInfo = JSON.parse(JSON.stringify(pool));
    poolInfo.coin.balance = new TokenAmount(0, coin.decimals);
    poolInfo.pc.balance = new TokenAmount(0, pc.decimals);

    liquidityPools[lp.mintAddress] = poolInfo;
  });

  const multipleInfo = await getMultipleAccounts(conn, publicKeys, "confirmed");
  multipleInfo.forEach(info => {
    if (info) {
      const address = info.publicKey.toBase58();
      const data = Buffer.from(info.account.data);

      const { key, lpMintAddress, version } = getAddressForWhat(address);

      if (key && lpMintAddress) {
        const poolInfo = liquidityPools[lpMintAddress];

        switch (key) {
          case "poolCoinTokenAccount": {
            const parsed = ACCOUNT_LAYOUT.decode(data);
            // quick fix: Number can only safely store up to 53 bits
            poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(
              getBigNumber(parsed.amount)
            );

            break;
          }
          case "poolPcTokenAccount": {
            const parsed = ACCOUNT_LAYOUT.decode(data);

            poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(
              getBigNumber(parsed.amount)
            );

            break;
          }
          case "ammOpenOrders": {
            const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(
              new PublicKey(poolInfo.serumProgramId)
            );
            const parsed = OPEN_ORDERS_LAYOUT.decode(data);

            const { baseTokenTotal, quoteTokenTotal } = parsed;
            poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(
              getBigNumber(baseTokenTotal)
            );
            poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(
              getBigNumber(quoteTokenTotal)
            );

            break;
          }
          case "ammId": {
            let parsed;
            if (version === 2) {
              parsed = AMM_INFO_LAYOUT.decode(data);
            } else if (version === 3) {
              parsed = AMM_INFO_LAYOUT_V3.decode(data);
            } else {
              if (version === 5) {
                parsed = AMM_INFO_LAYOUT_STABLE.decode(data);
                poolInfo.currentK = getBigNumber(parsed.currentK);
              } else {
                parsed = AMM_INFO_LAYOUT_V4.decode(data);
                if (getBigNumber(parsed.status) === 7) {
                  poolInfo.poolOpenTime = getBigNumber(parsed.poolOpenTime);
                }
              }

              const { swapFeeNumerator, swapFeeDenominator } = parsed;
              poolInfo.fees = {
                swapFeeNumerator: getBigNumber(swapFeeNumerator),
                swapFeeDenominator: getBigNumber(swapFeeDenominator)
              };
            }

            const { status, needTakePnlCoin, needTakePnlPc } = parsed;
            poolInfo.status = getBigNumber(status);
            poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(
              getBigNumber(needTakePnlCoin)
            );
            poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(
              getBigNumber(needTakePnlPc)
            );

            break;
          }
          // getLpSupply
          case "lpMintAddress": {
            const parsed = MINT_LAYOUT.decode(data);

            poolInfo.lp.totalSupply = new TokenAmount(
              getBigNumber(parsed.supply),
              poolInfo.lp.decimals
            );

            break;
          }
        }
      }
    }
  });
  return liquidityPools;
}

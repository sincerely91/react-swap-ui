import { initializeAccount } from "@project-serum/serum/lib/token-instructions";
import { WalletContextState } from "@solana/wallet-adapter-react";

// @ts-ignore without ts ignore, yarn build will failed
import { Token } from "@solana/spl-token";
import {
    Keypair,                                                              // Account is deprecated, using Keypair instead
    Commitment,
    Connection,
    PublicKey,
    TransactionSignature,
    Transaction,
    SystemProgram,
    AccountInfo,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";

import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "./ids";
import { ACCOUNT_LAYOUT } from "./layouts";

export const commitment: Commitment = "confirmed";
export async function createTokenAccountIfNotExist(                     // returns Token Account
    connection: Connection,
    account: string | undefined | null,
    owner: PublicKey,
    mintAddress: string,
    lamports: number | null,

    transaction: Transaction,
    signer: Array<Keypair>
) : Promise<PublicKey> {
    let publicKey;

    if (account) {
        publicKey = new PublicKey(account);
    } else {
        publicKey = await createProgramAccountIfNotExist(
            connection,
            account,
            owner,
            TOKEN_PROGRAM_ID,
            lamports,
            ACCOUNT_LAYOUT,
            transaction,
            signer
        );

        transaction.add(
            initializeAccount({
                account: publicKey,
                mint: new PublicKey(mintAddress),
                owner
            })
        );
    }
    return publicKey;
}

export async function createAssociatedTokenAccountIfNotExist(
    account: string | undefined | null,
    owner: PublicKey,
    mintAddress: string,

    transaction: Transaction,
    atas: string[] = []
) {
    let publicKey;
    if (account) {
        publicKey = new PublicKey(account);
    }

    const mint = new PublicKey(mintAddress);
    // @ts-ignore without ts ignore, yarn build will failed
    const ata = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        owner,
        true
    );

    if (
        (!publicKey || !ata.equals(publicKey)) &&
        !atas.includes(ata.toBase58())
    ) {
        transaction.add(
            Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                ata,
                owner,
                owner
            )
        );
        atas.push(ata.toBase58());
    }

    return ata;
}

export async function sendTransaction(
    connection: Connection,
    wallet: any,
    transaction: Transaction,
    signers: Array<Keypair> = []
) {
    const txid: TransactionSignature = await wallet.sendTransaction(
        transaction,
        connection,
        {
            signers,
            skipPreflight: true,
            preflightCommitment: commitment
        }
    );

    return txid;
}

export async function createProgramAccountIfNotExist(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  programId: PublicKey,
  lamports: number | null,
  layout: any,

  transaction: Transaction,
  signer: Array<Keypair>
) {
  let publicKey;

  if (account) {
    publicKey = new PublicKey(account);
  } else {
    const newAccount = new Keypair();
    publicKey = newAccount.publicKey;

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: publicKey,
        lamports:
          lamports ??
          (await connection.getMinimumBalanceForRentExemption(layout.span)),
        space: layout.span,
        programId
      })
    );

    signer.push(newAccount);
  }

    return publicKey;
}

export async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
) {
    const { publicKey } = await findProgramAddress(
        [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return publicKey;
}

export async function findProgramAddress(
    seeds: Array<Buffer | Uint8Array>,
    programId: PublicKey
) {
    const [publicKey, nonce] = await PublicKey.findProgramAddress(
        seeds,
        programId
    );
    return { publicKey, nonce };
}

export async function getMultipleAccounts(
    connection: Connection,
    publicKeys: PublicKey[],
    commitment?: Commitment
): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
    const keys: PublicKey[][] = [];
    let tempKeys: PublicKey[] = [];

    publicKeys.forEach(k => {
        if (tempKeys.length >= 100) {
        keys.push(tempKeys);
        tempKeys = [];
        }
        tempKeys.push(k);
    });
    if (tempKeys.length > 0) {
        keys.push(tempKeys);
    }

    const accounts: Array<null | {
        executable: any;
        owner: PublicKey;
        lamports: any;
        data: Buffer;
    }> = [];
    const resArray: { [key: number]: any } = {};

    await Promise.all(
        keys.map(async (key, index) => {
        const res = await connection.getMultipleAccountsInfo(key, commitment);
        resArray[index] = res;
        })
    );

    Object.keys(resArray)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(itemIndex => {
            const res = resArray[parseInt(itemIndex)];
            for (const account of res) {
                accounts.push(account);
            }
        });

    return accounts.map((account, idx) => {
        if (account === null) {
        return null;
        }
        return {
        publicKey: publicKeys[idx],
        account
        };
    });
}

export async function getFilteredProgramAccountsAmmOrMarketCache(
  cacheName: String,
  connection: Connection,
  programId: PublicKey,
  filters: any
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  try {
    if (!cacheName) {
        throw new Error("cacheName error");
    }

    const resp = await (
      await fetch("https://api.raydium.io/cache/rpc/" + cacheName)
    ).json();
    if (resp.error) {
      throw new Error(resp.error.message);
    }
    // @ts-ignore
    return resp.result.map(
      // @ts-ignore
      ({ pubkey, account: { data, executable, owner, lamports } }) => ({
        publicKey: new PublicKey(pubkey),
        accountInfo: {
          data: Buffer.from(data[0], "base64"),
          executable,
          owner: new PublicKey(owner),
          lamports
        }
      })
    );
  } catch (e) {
    return getFilteredProgramAccounts(connection, programId, filters);
  }
}

export async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters: any
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  // @ts-ignore
  const resp = await connection._rpcRequest("getProgramAccounts", [
    programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
      encoding: "base64"
    }
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result.map(
    // @ts-ignore
    ({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], "base64"),
        executable,
        owner: new PublicKey(owner),
        lamports
      }
    })
  );
}

export async function createAmmAuthority(programId: PublicKey) {
  return await findProgramAddress(
    [
      new Uint8Array(
        Buffer.from("amm authority".replace("\u00A0", " "), "utf-8")
      )
    ],
    programId
  );
}
// export interface ISplToken {
//   pubkey: string;
//   parsedInfo: any;
//   amount: number;
// }

export const getSPLTokenData = async (
  wallet: WalletContextState,
  connection: Connection
): Promise<ISplToken[]> => {
  if (!wallet.connected) {
    return [];
  }
  const res = await connection.getParsedTokenAccountsByOwner(
    wallet.publicKey!,
    {
      programId: new PublicKey(TOKEN_PROGRAM_ID)
    },
    "confirmed"
  );
                                                                            // Get all SPL tokens owned by connected wallet
  let data = await connection.getAccountInfo(wallet.publicKey!);

  let list = res.value.map(item => {
    let token = {
      pubkey: item.pubkey.toBase58(),
      parsedInfo: item.account.data.parsed.info,
      amount:
        item.account.data.parsed.info.tokenAmount.amount /
        10 ** item.account.data.parsed.info.tokenAmount.decimals
    };
                                                                            // Filter out empty account
    if (item.account.data.parsed.info.tokenAmount.decimals === 0) {
      return undefined;
    } else {
      return token;
    }
  });
                                                                            // Add SOL into list
  list.push({
    //@ts-ignore
    pubkey: wallet.publicKey?.toBase58(),
    parsedInfo: {
      mint: data?.owner.toBase58()
    },
    //@ts-ignore
    amount: data?.lamports / LAMPORTS_PER_SOL
  });
  return list as ISplToken[];
};

import { TokenListProvider } from "@solana/spl-token-registry";

const SPLTokenRegistrySource = async () => {
  let tokens = await new TokenListProvider().resolve()
  let tokenList = tokens.filterByClusterSlug("mainnet-beta").getList()
  return tokenList.sort((a: any, b: any) =>
    a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0
  )
};

export default SPLTokenRegistrySource;

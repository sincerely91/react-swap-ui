import { TokenListProvider } from "@solana/spl-token-registry";

const SPLTokenRegistrySource = () => {
  return new TokenListProvider().resolve().then(tokens => {
    const tokenList = tokens.filterByClusterSlug("mainnet-beta").getList();
    return tokenList.sort((a: any, b: any) =>
      a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0
    );
  });
};

export default SPLTokenRegistrySource;

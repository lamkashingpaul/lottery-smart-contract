import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui/components/item";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useChainId, useChains, useSwitchChain } from "wagmi";
import type { ChainId } from "@/features/common/types/chain-id.type";
import { lotteryContractAddresses } from "@/features/lotteries/constants/lottery-contract-addresses.constant";

export const ChainSelectionTabs = () => {
  const switchChain = useSwitchChain();
  const chains = useChains();
  const currentChainId = useChainId();

  const handleChainChange = async (value: string) => {
    const chainId = Number.parseInt(value, 10) as ChainId;
    await switchChain.mutateAsync({ chainId });
  };

  const availableChains = chains.filter(
    (chain) => lotteryContractAddresses[chain.id],
  );

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Select Network</ItemTitle>
        <ItemDescription>
          Choose the blockchain network to interact with the lottery
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Tabs
          value={currentChainId.toString()}
          onValueChange={handleChainChange}
        >
          <TabsList>
            {availableChains.map((chain) => (
              <TabsTrigger key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ItemActions>
    </Item>
  );
};

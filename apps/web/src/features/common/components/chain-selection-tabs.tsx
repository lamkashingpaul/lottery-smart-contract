"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@workspace/ui/components/item";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useChainId, useChains, useSwitchChain } from "wagmi";
import type { ChainId } from "@/features/common/types/chain-id.type";
import { RAFFLE_CONTRACT_ADDRESSES } from "@/features/lotteries/constants/raffle-contract-addresses.constant";

export const ChainSelectionTabs = () => {
  const switchChain = useSwitchChain();
  const chains = useChains();
  const currentChainId = useChainId();
  const availableChains = chains.filter(
    (chain) => RAFFLE_CONTRACT_ADDRESSES[chain.id],
  );

  const handleChainChange = async (value: string) => {
    const chainId = Number.parseInt(value, 10) as ChainId;
    await switchChain.mutateAsync({ chainId });
  };

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Select Network</ItemTitle>
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

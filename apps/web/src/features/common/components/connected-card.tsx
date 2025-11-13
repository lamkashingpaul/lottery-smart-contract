"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { ChainSelectionTabs } from "@/features/common/components/chain-selection-tabs";
import { VerifiedBadgeIcon } from "@/features/common/components/icons/verified-badge-icon";
import { getAddressInitials } from "@/features/common/utils/get-address-initials";
import { truncateAddress } from "@/features/common/utils/truncate-address";

export const ConnectedCard = () => {
  const { address } = useConnection();
  const { mutate: disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined });

  const displayName = ensName || (address ? truncateAddress(address) : "");
  const initials = address ? getAddressInitials(address) : "??";

  return (
    <Card className="w-full border-2 border-accent/30 bg-linear-to-br from-card via-card to-accent/5 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-2 items-center justify-center">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-green-400"></span>
            </span>
          </div>
          <CardTitle className="text-lg">Wallet Connected</CardTitle>
        </div>
        <CardDescription>⚡ Ready to dominate the arena</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-4">
          <div className="relative">
            <Avatar className="size-14 border-2 border-accent/50 shadow-lg">
              <AvatarImage src={ensAvatar ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-linear-to-br from-primary to-accent font-bold text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-linear-to-br from-accent to-primary">
              <VerifiedBadgeIcon className="size-3 text-white" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <p className="truncate font-bold text-xl">{displayName}</p>
            {ensName && address && (
              <p className="font-mono text-muted-foreground text-sm">
                {truncateAddress(address)}
              </p>
            )}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-medium text-accent text-xs">
                <span className="size-1.5 rounded-full bg-accent"></span>
                Player
              </span>
            </div>
          </div>
        </div>
        <ChainSelectionTabs />
      </CardContent>
      <CardFooter className="justify-end border-border/50 border-t pt-4">
        <Button
          className="w-full border border-destructive/50 font-semibold transition-all hover:scale-[1.02]"
          variant="destructive"
          onClick={() => disconnect()}
        >
          🚪 Disconnect Wallet
        </Button>
      </CardFooter>
    </Card>
  );
};

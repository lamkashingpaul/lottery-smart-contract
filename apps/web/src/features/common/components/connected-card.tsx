"use client";

import {
  Avatar,
  AvatarBadge,
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connected</CardTitle>
        <CardDescription>Wallet connected successfully</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={ensAvatar ?? undefined} alt={displayName} />
            <AvatarFallback className="font-semibold text-lg">
              {initials}
            </AvatarFallback>
            <AvatarBadge className="bg-green-600 dark:bg-green-800" />
          </Avatar>
          <div className="flex flex-col gap-1 overflow-hidden">
            <p className="truncate font-semibold text-lg">{displayName}</p>
            {ensName && address && (
              <p className="font-mono text-muted-foreground text-sm">
                {truncateAddress(address)}
              </p>
            )}
          </div>
        </div>
        <ChainSelectionTabs />
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          className="w-full"
          variant="destructive"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </CardFooter>
    </Card>
  );
};

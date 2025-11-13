"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useEffect, useMemo, useState } from "react";
import {
  type Connector,
  type CreateConnectorFn,
  useConnect,
  useConnectors,
} from "wagmi";
import { LightningIcon } from "@/features/common/components/icons/lightning-icon";
import { formatConnectErrorMessage } from "@/features/common/utils/format-connect-error-message";

type WalletOptionProps = {
  connector: Connector<CreateConnectorFn>;
  onClick: () => void;
  disabled?: boolean;
};

export const DisconnectedCard = () => {
  const { mutate: connect, status, error } = useConnect();
  const connectors = useConnectors();

  const {
    title: cardTitle,
    description: cardDescription,
    descriptionClassName: cardDescriptionClassName,
  } = useMemo(() => {
    if (status === "error") {
      return {
        title: "⚠️ Connection Failed",
        description: formatConnectErrorMessage(error),
        descriptionClassName: "text-destructive",
      };
    }
    if (status === "pending") {
      return {
        title: "⏳ Establishing Connection...",
        description: "Linking your wallet to the game arena. Stand by...",
        descriptionClassName: "text-accent",
      };
    }
    return {
      title: "🎮 Welcome, Warrior",
      description:
        "Connect your wallet to enter the arena and compete for glory!",
      descriptionClassName: "text-muted-foreground",
    };
  }, [status, error]);

  return (
    <Card className="w-full max-w-md border-2 border-primary/30 bg-linear-to-br from-card via-card to-primary/5 shadow-2xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent shadow-lg">
          <LightningIcon className="size-10 text-primary-foreground" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="font-bold text-2xl">{cardTitle}</CardTitle>
          <CardDescription className={`text-base ${cardDescriptionClassName}`}>
            {cardDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="flex-col gap-3">
        {connectors.length === 0 ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="font-medium text-destructive">No wallets detected</p>
            <p className="text-destructive/80 text-sm">
              Please install a Web3 wallet
            </p>
          </div>
        ) : (
          <div className="grid w-full gap-2">
            {connectors.map((connector) => (
              <WalletOption
                key={connector.uid}
                connector={connector}
                onClick={() => connect({ connector })}
                disabled={status === "pending"}
              />
            ))}
          </div>
        )}
        <p className="text-center text-muted-foreground text-xs">
          🔒 Secure • Decentralized • Verifiable
        </p>
      </CardFooter>
    </Card>
  );
};

const WalletOption = (props: WalletOptionProps) => {
  const { connector, onClick, disabled } = props;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <Button
      className="group relative overflow-hidden border-2 border-primary/40 bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 font-semibold transition-all hover:scale-[1.02] hover:border-primary/60 disabled:hover:scale-100"
      size="lg"
      disabled={!ready || disabled}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="relative">🔗 {connector.name}</span>
    </Button>
  );
};

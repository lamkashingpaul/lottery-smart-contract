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
        title: "Error connecting to wallet",
        description: formatConnectErrorMessage(error),
        descriptionClassName: "text-destructive",
      };
    }
    if (status === "pending") {
      return {
        title: "Connecting to wallet...",
        description: "Please wait while we connect to your wallet.",
        descriptionClassName: "text-muted-foreground",
      };
    }
    return {
      title: "Wallet is disconnected",
      description: "Please connect your wallet to continue.",
      descriptionClassName: "text-muted-foreground",
    };
  }, [status, error]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription className={cardDescriptionClassName}>
          {cardDescription}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {connectors.length === 0 ? (
          <div>No connectors available</div>
        ) : (
          connectors.map((connector) => (
            <WalletOption
              key={connector.uid}
              connector={connector}
              onClick={() => connect({ connector })}
              disabled={status === "pending"}
            />
          ))
        )}
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
    <Button disabled={!ready || disabled} onClick={onClick}>
      {connector.name}
    </Button>
  );
};

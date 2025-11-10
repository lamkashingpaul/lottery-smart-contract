"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useDisconnect } from "wagmi";

export const ConnectedCard = () => {
  const { mutate: disconnect } = useDisconnect();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connected</CardTitle>
        <CardDescription>Wallet connected successfully</CardDescription>
      </CardHeader>
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

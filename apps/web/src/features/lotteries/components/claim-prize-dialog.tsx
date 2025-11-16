"use client";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CoinsIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useGetPlayerWinning } from "@/features/lotteries/api/use-get-player-winning";
import { useWithdrawWinnings } from "@/features/lotteries/api/use-withdraw-winnings";
import { formatRaffleErrorMessage } from "@/features/lotteries/utils/format-raffle-error-message";

type ClaimPrizeDialogProps = {
  disabled?: boolean;
};

export const ClaimPrizeDialog = (props: ClaimPrizeDialogProps) => {
  const { disabled = false } = props;

  const [open, setOpen] = useState(false);
  const { data: winningData, isLoading: isLoadingWinning } =
    useGetPlayerWinning();
  const {
    w: { isPending, isSuccess, isError, error, reset },
    withdrawWinnings,
  } = useWithdrawWinnings();

  const winningAmount = winningData ?? 0n;
  const hasWinnings = winningAmount > 0n;
  const formattedWinning = formatEther(winningAmount);

  const handleClaim = async () => {
    try {
      await withdrawWinnings();
    } catch (err) {
      console.error("Failed to claim prize:", err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || isLoadingWinning || !hasWinnings}
          className={cn(
            "group relative overflow-hidden border-2 font-bold text-base shadow-xl transition-all hover:scale-[1.02]",
            hasWinnings
              ? "glow-primary gradient-gamefi border-accent/50"
              : "border-muted bg-muted text-muted-foreground",
          )}
        >
          <TrophyIcon
            className={cn(
              "mr-2 size-5",
              hasWinnings && "animate-pulse text-yellow-300",
            )}
          />
          {isLoadingWinning ? (
            "Checking Prizes..."
          ) : hasWinnings ? (
            <>
              Claim Prize
              <Badge className="ml-2 bg-yellow-500 text-black">
                {formattedWinning} ETH
              </Badge>
            </>
          ) : (
            "No Prizes Yet"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="glow-border-primary border-2 border-accent/50 bg-linear-to-br from-background via-background to-accent/10 shadow-2xl sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="gradient-gamefi glow-primary flex size-16 items-center justify-center rounded-full p-1">
              <div className="flex size-full items-center justify-center rounded-full bg-background">
                <TrophyIcon className="size-8 text-yellow-400" />
              </div>
            </div>
          </div>
          <DialogTitle
            className={cn(
              "text-center font-bold text-2xl",
              "text-gradient-gamefi",
            )}
          >
            {isSuccess ? "Victory Claimed! 🎉" : "Claim Your Prize"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isSuccess
              ? "Your winnings have been transferred to your wallet"
              : "Withdraw your hard-earned prize to your wallet"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="glow-border-accent rounded-xl border-2 border-accent/30 bg-linear-to-br from-accent/5 via-transparent to-primary/5 p-6">
            <div className="flex items-center justify-center gap-3">
              <CoinsIcon className="size-8 text-yellow-400" />
              <div className="text-center">
                <p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                  Prize Amount
                </p>
                <p
                  className={cn("font-black text-3xl", "text-gradient-gamefi")}
                >
                  {formattedWinning} ETH
                </p>
              </div>
              <SparklesIcon className="size-8 text-cyan-400" />
            </div>
          </div>

          {isPending && (
            <Alert className="border-accent/50 bg-accent/10">
              <Spinner className="size-4" />
              <AlertDescription className="ml-2">
                Processing your claim... Please confirm the transaction in your
                wallet.
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircleIcon className="size-4 text-green-500" />
              <AlertDescription className="ml-2 text-green-500">
                Success! Your prize has been claimed and transferred to your
                wallet.
              </AlertDescription>
            </Alert>
          )}

          {isError && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircleIcon className="size-4 text-destructive" />
              <AlertDescription className="ml-2">
                <strong>Claim Failed:</strong> {formatRaffleErrorMessage(error)}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="border-accent/20">
          {!isSuccess && (
            <>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="border-accent/30"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleClaim}
                disabled={isPending || !hasWinnings}
                className="gradient-gamefi glow-primary border-2 border-accent/50 font-bold shadow-xl transition-all hover:scale-[1.02]"
              >
                {isPending ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <TrophyIcon className="mr-2 size-4" />
                    Claim {formattedWinning} ETH
                  </>
                )}
              </Button>
            </>
          )}
          {isSuccess && (
            <DialogClose asChild>
              <Button className="gradient-gamefi w-full border-2 border-accent/50 font-bold">
                <CheckCircleIcon className="mr-2 size-4" />
                Close
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

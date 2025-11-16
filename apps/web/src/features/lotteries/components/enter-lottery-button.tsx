import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { AlertCircle, CheckCircle2, Clock, Ticket } from "lucide-react";
import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useEnterRaffle } from "@/features/lotteries/api/use-enter-raffle";
import { useReadRaffleDetails } from "@/features/lotteries/api/use-read-raffle-details";
import { formatRaffleErrorMessage } from "@/features/lotteries/utils/format-raffle-error-message";

type EnterLotteryButtonProps = {
  isRaffleOpen: boolean;
};

export const EnterLotteryButton = (props: EnterLotteryButtonProps) => {
  const { isRaffleOpen } = props;
  const { refetch } = useReadRaffleDetails();
  const {
    w: { data: hash, error, isPending },
    enterRaffle,
  } = useEnterRaffle();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleClick = async () => {
    try {
      await enterRaffle();
    } catch (err) {
      console.error("Failed to enter the raffle:", err);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  return (
    <div className="w-full space-y-4">
      <Button
        className="group relative w-full overflow-hidden border-2 border-primary/50 bg-linear-to-r from-primary via-primary/90 to-accent font-bold text-lg shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl disabled:hover:scale-100"
        size="lg"
        disabled={!isRaffleOpen || isPending || isConfirming}
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {isPending || isConfirming ? (
          <>
            <Spinner />
            {isPending ? "Awaiting Wallet..." : "Processing Transaction..."}
          </>
        ) : (
          <>
            <Ticket className="size-5" />🎮 Enter Game Arena
          </>
        )}
      </Button>

      {!isRaffleOpen ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
          <p className="font-medium text-amber-200 text-sm">
            ⚠️ Arena Temporarily Closed
          </p>
          <p className="text-muted-foreground text-xs">
            We're selecting the champion. Check back in a moment!
          </p>
        </div>
      ) : null}

      {isPending ? (
        <Alert className="border-2 border-accent/50 bg-accent/10">
          <Clock className="text-accent" />
          <AlertTitle className="text-accent">
            ⏳ Wallet Confirmation Required
          </AlertTitle>
          <AlertDescription className="text-accent-foreground/80">
            Check your wallet and approve the transaction to join the game
            arena.
          </AlertDescription>
        </Alert>
      ) : null}

      {isConfirming && hash ? (
        <Alert className="border-2 border-primary/50 bg-primary/10">
          <Spinner className="text-primary" />
          <AlertTitle className="text-primary">
            ⚡ Transaction Mining
          </AlertTitle>
          <AlertDescription className="text-primary-foreground/80">
            Your entry is being processed on the blockchain. Hang tight,
            champion!
          </AlertDescription>
        </Alert>
      ) : null}

      {isConfirmed ? (
        <Alert className="animate-pulse border-2 border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="text-green-400" />
          <AlertTitle className="text-green-400">
            🎉 Victory Position Secured!
          </AlertTitle>
          <AlertDescription className="text-green-300/80">
            You're in the game! May fortune smile upon you, warrior.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="border-2">
          <AlertCircle />
          <AlertTitle>❌ Transaction Failed</AlertTitle>
          <AlertDescription>{formatRaffleErrorMessage(error)}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};

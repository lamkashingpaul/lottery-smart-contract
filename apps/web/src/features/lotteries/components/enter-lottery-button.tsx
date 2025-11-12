import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { AlertCircle, CheckCircle2, Clock, Ticket } from "lucide-react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useEnterRaffle } from "@/features/lotteries/api/use-enter-raffle";
import { formatRaffleErrorMessage } from "@/features/lotteries/utils/format-raffle-error-message";

type EnterLotteryButtonProps = {
  isRaffleOpen: boolean;
};

export const EnterLotteryButton = (props: EnterLotteryButtonProps) => {
  const { isRaffleOpen } = props;
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

  return (
    <div className="w-full space-y-3">
      <Button
        className="w-full"
        size="lg"
        disabled={!isRaffleOpen || isPending || isConfirming}
        onClick={handleClick}
      >
        {isPending || isConfirming ? (
          <>
            <Spinner />
            {isPending ? "Confirming..." : "Processing..."}
          </>
        ) : (
          <>
            <Ticket className="size-4" />
            Enter Raffle
          </>
        )}
      </Button>

      {!isRaffleOpen ? (
        <p className="text-center text-muted-foreground text-xs">
          The raffle will reopen once the winner is selected
        </p>
      ) : null}

      {isPending ? (
        <Alert>
          <Clock />
          <AlertTitle>Awaiting Confirmation</AlertTitle>
          <AlertDescription>
            Please confirm the transaction in your wallet to enter the raffle.
          </AlertDescription>
        </Alert>
      ) : null}

      {isConfirming && hash ? (
        <Alert>
          <Spinner />
          <AlertTitle>Transaction Submitted</AlertTitle>
          <AlertDescription>
            Your transaction is being confirmed on the blockchain. This may take
            a few moments.
          </AlertDescription>
        </Alert>
      ) : null}

      {isConfirmed ? (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            You have successfully entered the raffle. Good luck!
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Transaction Failed</AlertTitle>
          <AlertDescription>
            {formatRaffleErrorMessage(error)}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};

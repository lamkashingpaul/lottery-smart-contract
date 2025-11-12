import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  AlertCircle,
  Clock,
  Coins,
  Network,
  RefreshCcw,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { useConnection } from "wagmi";
import { ChainSelectionTabs } from "@/features/common/components/chain-selection-tabs";
import { DisconnectedCard } from "@/features/common/components/disconnected-card";
import { ZERO_ADDRESS } from "@/features/common/constants/zero-address";
import { useReadRaffleDetails } from "@/features/lotteries/api/use-read-raffle-details";
import { calculateTimeUntilDraw } from "@/features/lotteries/utils/calculate-time-until-draw";
import { formatRaffleWinner } from "@/features/lotteries/utils/format-raffle-winner";
import { formatTimeRemaining } from "@/features/lotteries/utils/format-time-remaining";

export const LotteryDashboardCard = () => {
  const { isConnected } = useConnection();
  const { data, isLoading, isError, error, isEnabled } = useReadRaffleDetails();

  if (!isConnected) {
    return <DisconnectedCard />;
  }

  if (!isEnabled) {
    return <UnsupportedNetworkState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState error={error} />;
  }

  // it is guaranteed that data is not undefined at this point, fallbacks are provided for better type inference
  const entranceFee = data[0].result ?? 0n;
  const recentWinner = data[1].result ?? ZERO_ADDRESS;
  const raffleState = data[2].result ?? -1;
  const numberOfPlayers = data[3].result ?? 0n;
  const lastTimeStamp = data[4].result ?? 0n;
  const interval = data[5].result ?? 0n;

  const entranceFeeInEth = Number(entranceFee) / 1e18;
  const isRaffleOpen = raffleState === 0;

  return (
    <DashboardContent
      entranceFeeInEth={entranceFeeInEth}
      recentWinner={recentWinner}
      isRaffleOpen={isRaffleOpen}
      numberOfPlayers={numberOfPlayers}
      lastTimeStamp={lastTimeStamp}
      interval={interval}
    />
  );
};

const UnsupportedNetworkState = () => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Network />
        </EmptyMedia>
        <EmptyTitle>Unsupported Network</EmptyTitle>
        <EmptyDescription>
          The current chain is not supported. Please switch to a supported
          network to access the lottery dashboard.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ChainSelectionTabs />
      </EmptyContent>
    </Empty>
  );
};

const LoadingState = () => {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading Raffle Details</EmptyTitle>
        <EmptyDescription>
          Please wait while we fetch the lottery information from the
          blockchain.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

const ErrorState = ({ error }: { error?: Error | null }) => {
  return (
    <Empty className="h-full bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>Failed to Load Raffle</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          {error?.message ||
            "An error occurred while fetching the raffle details. Please try again."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw />
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
};

const DashboardContent = ({
  entranceFeeInEth,
  recentWinner,
  isRaffleOpen,
  numberOfPlayers,
  lastTimeStamp,
  interval,
}: {
  entranceFeeInEth: number;
  recentWinner: string;
  isRaffleOpen: boolean;
  numberOfPlayers: bigint;
  lastTimeStamp: bigint;
  interval: bigint;
}) => {
  const timeUntilDraw = calculateTimeUntilDraw(lastTimeStamp, interval);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lottery Dashboard</CardTitle>
          <Badge variant={isRaffleOpen ? "default" : "secondary"}>
            {isRaffleOpen ? "Open" : "Calculating Winner..."}
          </Badge>
        </div>
        <CardDescription>
          {isRaffleOpen
            ? "Enter the raffle for a chance to win the prize pool"
            : "The raffle is currently calculating the winner"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            icon={<Coins className="size-4" />}
            label="Entrance Fee"
            value={`${entranceFeeInEth} ETH`}
          />
          <StatCard
            icon={<Users className="size-4" />}
            label="Players Entered"
            value={numberOfPlayers.toString()}
          />
          <StatCard
            icon={<Trophy className="size-4" />}
            label="Recent Winner"
            value={formatRaffleWinner(recentWinner)}
          />
          <StatCard
            icon={<Clock className="size-4" />}
            label="Next Draw In"
            value={formatTimeRemaining(timeUntilDraw)}
          />
        </div>

        <Separator />

        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Ticket className="size-4" />
            <span>Current Prize Pool</span>
          </div>
          <div className="font-bold text-2xl">
            {(entranceFeeInEth * Number(numberOfPlayers)).toFixed(4)} ETH
          </div>
          <p className="text-muted-foreground text-xs">
            Winner takes the entire prize pool
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" size="lg" disabled={!isRaffleOpen}>
          <Ticket className="size-4" />
          Enter Raffle for {entranceFeeInEth} ETH
        </Button>
        {!isRaffleOpen && (
          <p className="text-center text-muted-foreground text-xs">
            The raffle will reopen once the winner is selected
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-lg">{value}</div>
    </div>
  );
};

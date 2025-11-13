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
import { cn } from "@workspace/ui/lib/utils";
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
import type { Address } from "viem";
import { useConnection } from "wagmi";
import { ChainSelectionTabs } from "@/features/common/components/chain-selection-tabs";
import { DisconnectedCard } from "@/features/common/components/disconnected-card";
import { useReadRaffleDetails } from "@/features/lotteries/api/use-read-raffle-details";
import { EnterLotteryButton } from "@/features/lotteries/components/enter-lottery-button";
import { calculateTimeUntilDraw } from "@/features/lotteries/utils/calculate-time-until-draw";
import { formatRaffleWinner } from "@/features/lotteries/utils/format-raffle-winner";
import { formatTimeRemaining } from "@/features/lotteries/utils/format-time-remaining";

type DashboardContentProps = {
  entranceFeeInEth: number;
  recentWinner: Address;
  isRaffleOpen: boolean;
  numberOfPlayers: bigint;
  lastTimeStamp: bigint;
  interval: bigint;
};

type ErrorStateProps = {
  error?: Error | null;
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "primary" | "accent";
};

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

  if (isError || !data || data.some((item) => item.status === "failure")) {
    return <ErrorState error={error} />;
  }

  // it is guaranteed that data is not undefined at this point, types are added for better developer experience and readability
  const entranceFee = data[0].result as bigint;
  const recentWinner = data[1].result as Address;
  const raffleState = data[2].result as number;
  const numberOfPlayers = data[3].result as bigint;
  const lastTimeStamp = data[4].result as bigint;
  const interval = data[5].result as bigint;

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
    <Empty className="border-2 border-amber-500/30 border-dashed bg-amber-500/5">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <div className="rounded-full border-2 border-amber-500/50 bg-amber-500/10 p-4">
            <Network className="size-8 text-amber-400" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-2xl">⚠️ Unsupported Network</EmptyTitle>
        <EmptyDescription className="max-w-md text-base">
          This arena is not available on the current network. Switch to a
          supported chain to join the competition.
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
    <Empty className="w-full border-2 border-primary/30 bg-linear-to-br from-card to-primary/5">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <div className="glow-primary animate-pulse rounded-full border-2 border-primary/50 bg-primary/10 p-4">
            <Spinner className="size-8 text-primary" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-2xl">⚡ Loading Arena Data</EmptyTitle>
        <EmptyDescription className="max-w-md text-base">
          Fetching live lottery information from the blockchain. This will only
          take a moment...
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

const ErrorState = (props: ErrorStateProps) => {
  const { error } = props;

  return (
    <Empty className="h-full border-2 border-destructive/30 bg-destructive/5">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <div className="rounded-full border-2 border-destructive/50 bg-destructive/10 p-4">
            <AlertCircle className="size-8 text-destructive" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-2xl">❌ Failed to Load Arena</EmptyTitle>
        <EmptyDescription className="max-w-md text-pretty text-base">
          {error?.message ||
            "Something went wrong while loading the lottery data. Please try refreshing or check your connection."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="lg"
          className="border-2 border-primary/50 bg-primary/10 font-semibold hover:bg-primary/20"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw className="size-4" />🔄 Retry Connection
        </Button>
      </EmptyContent>
    </Empty>
  );
};

const DashboardContent = (props: DashboardContentProps) => {
  const {
    entranceFeeInEth,
    recentWinner,
    isRaffleOpen,
    numberOfPlayers,
    lastTimeStamp,
    interval,
  } = props;
  const timeUntilDraw = calculateTimeUntilDraw(lastTimeStamp, interval);

  return (
    <Card className="relative w-full overflow-hidden border-2 border-primary/20 bg-card shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />

      <CardHeader className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 font-bold text-2xl">
              <Trophy className="size-6 text-primary" />
              <span className="text-gradient-gamefi">Lottery Arena</span>
            </CardTitle>
            <CardDescription className="text-base">
              {isRaffleOpen
                ? "🎮 Battle for the prize pool - May the odds be in your favor!"
                : "⏳ Calculating champion... Stand by!"}
            </CardDescription>
          </div>
          <Badge
            variant={isRaffleOpen ? "default" : "secondary"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm",
              isRaffleOpen && "glow-border-primary animate-pulse",
            )}
          >
            <span className="relative flex size-2">
              {isRaffleOpen && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground opacity-75"></span>
              )}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  isRaffleOpen
                    ? "bg-primary-foreground"
                    : "bg-secondary-foreground",
                )}
              ></span>
            </span>
            {isRaffleOpen ? "LIVE" : "DRAWING"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            icon={<Coins className="size-4" />}
            label="Entry Fee"
            value={`${entranceFeeInEth} ETH`}
            variant="primary"
          />
          <StatCard
            icon={<Users className="size-4" />}
            label="Active Players"
            value={numberOfPlayers.toString()}
            variant="accent"
          />
          <StatCard
            icon={<Trophy className="size-4" />}
            label="Last Champion"
            value={formatRaffleWinner(recentWinner)}
            variant="default"
          />
          <StatCard
            icon={<Clock className="size-4" />}
            label="Draw Countdown"
            value={formatTimeRemaining(timeUntilDraw)}
            variant="default"
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="relative space-y-3 overflow-hidden rounded-xl border-2 border-primary/30 bg-linear-to-br from-primary/10 via-accent/5 to-primary/10 p-6 shadow-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent shadow-lg">
              <Ticket className="size-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-muted-foreground text-sm">
                Total Prize Pool
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-black text-3xl text-gradient-gamefi">
                  {(entranceFeeInEth * Number(numberOfPlayers)).toFixed(4)}
                </span>
                <span className="font-bold text-accent text-lg">ETH</span>
              </div>
            </div>
          </div>
          <p className="relative text-center text-muted-foreground text-xs leading-relaxed">
            🏆 Winner takes all • 100% of the prize pool
          </p>
        </div>
      </CardContent>

      <CardFooter className="relative">
        <EnterLotteryButton isRaffleOpen={isRaffleOpen} />
      </CardFooter>
    </Card>
  );
};

const StatCard = (props: StatCardProps) => {
  const { icon, label, value, variant = "default" } = props;

  const variantClasses = {
    default: "border-border/50 bg-card/50",
    primary: "border-primary/30 bg-primary/5",
    accent: "border-accent/30 bg-accent/5",
  };

  return (
    <div
      className={cn(
        "group relative space-y-2 overflow-hidden rounded-xl border-2 p-4 transition-all hover:scale-105",
        variantClasses[variant],
      )}
    >
      <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-bold text-lg tracking-tight">{value}</div>
      <div className="absolute inset-0 bg-linear-to-br from-white/0 via-white/0 to-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
};

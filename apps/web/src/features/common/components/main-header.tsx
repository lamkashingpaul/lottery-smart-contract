import { CoinIcon } from "@/features/common/components/icons/coin-icon";

export const MainHeader = () => {
  return (
    <header className="sticky top-0 z-10 border-border/50 border-b backdrop-blur-xl supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent shadow-lg">
            <CoinIcon className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-gradient-gamefi text-xl leading-tight tracking-tight">
              CryptoLotto
            </h1>
            <p className="text-muted-foreground text-xs">GameFi Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 md:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-accent"></span>
            </span>
            <span className="font-medium text-accent text-xs">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export const calculateTimeUntilDraw = (
  lastTimeStamp: bigint,
  interval: bigint,
): number => {
  const nextDrawTime = Number(lastTimeStamp) + Number(interval);
  const now = Math.floor(Date.now() / 1000);
  const timeUntilDraw = nextDrawTime > now ? nextDrawTime - now : 0;
  return timeUntilDraw;
};

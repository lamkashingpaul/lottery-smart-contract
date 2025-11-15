import { useEffect, useState } from "react";
import { calculateTimeUntilDraw } from "../utils/calculate-time-until-draw";
import { formatTimeRemainingWithDays } from "../utils/format-time-remaining-with-days";

export const useLiveDrawCountdown = (
  lastTimeStamp: bigint,
  interval: bigint,
): string => {
  const [formattedTime, setFormattedTime] = useState(() => {
    const timeUntilDraw = calculateTimeUntilDraw(lastTimeStamp, interval);
    return formatTimeRemainingWithDays(timeUntilDraw);
  });

  useEffect(() => {
    // Update immediately when dependencies change
    const updateCountdown = () => {
      const timeUntilDraw = calculateTimeUntilDraw(lastTimeStamp, interval);
      setFormattedTime(formatTimeRemainingWithDays(timeUntilDraw));
    };

    updateCountdown();

    // Update every second to keep the countdown accurate
    const intervalId = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastTimeStamp, interval]);

  return formattedTime;
};

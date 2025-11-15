import { useEffect, useState } from "react";
import { formatLastUpdated } from "../utils/format-last-updated";

export const useLiveLastUpdated = (timestamp: number): string => {
  const [formattedTime, setFormattedTime] = useState(() =>
    formatLastUpdated(timestamp),
  );

  useEffect(() => {
    setFormattedTime(formatLastUpdated(timestamp));

    const interval = setInterval(() => {
      setFormattedTime(formatLastUpdated(timestamp));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timestamp]);

  return formattedTime;
};

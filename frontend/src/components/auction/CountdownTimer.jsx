import { memo } from "react";
import { pad } from "../../utils/formatters";

const ClockIcon = () => (
  <svg
    className="h-4 w-4 text-[#737373]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

/**
 * Countdown timer display — three digit-box segments (HH MM SS).
 *
 * @param {{ hours: number, minutes: number, secs: number }} props
 */
const CountdownTimer = memo(function CountdownTimer({ hours, minutes, secs }) {
  const segments = [pad(hours), pad(minutes), pad(secs)];

  return (
    <div className="flex items-center gap-2">
      <ClockIcon />
      <span className="text-xs text-[#737373]">Time Left</span>
      <div className="flex gap-1" aria-label={`${hours} hours ${minutes} minutes ${secs} seconds`}>
        {segments.map((val, i) => (
          <span
            key={i}
            className="flex h-8 w-10 items-center justify-center rounded-md bg-[#121212] text-sm font-bold tabular-nums text-white"
          >
            {val}
          </span>
        ))}
      </div>
    </div>
  );
});

export default CountdownTimer;

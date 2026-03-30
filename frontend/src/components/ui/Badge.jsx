import { memo } from "react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  live: "bg-[rgba(239,67,67,0.1)] text-[#ef4343]",
  winning: "bg-[#ad93e6] text-white",
  urgent: "bg-[rgba(239,67,67,0.12)] text-[#ef4343]",
  default: "bg-[rgba(173,147,230,0.12)] text-[#ad93e6]",
};

const DOT_COLORS = {
  live: "bg-[#ef4343]",
  urgent: "bg-[#ef4343]",
  winning: "bg-white",
  default: "bg-[#ad93e6]",
};

const Badge = memo(function Badge({
  variant = "default",
  dot = false,
  className,
  children,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        VARIANTS[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            DOT_COLORS[variant] ?? DOT_COLORS.default,
          )}
        />
      )}
      {children}
    </span>
  );
});

export default Badge;

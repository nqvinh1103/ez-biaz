import { memo } from "react";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

const Avatar = memo(function Avatar({
  initials,
  bg = "#ad93e6",
  size = "md",
  className,
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
});

export default Avatar;

import { memo } from "react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  primary:
    "bg-[#ad93e6] text-white hover:bg-[#9d7ed9] disabled:opacity-50 disabled:cursor-not-allowed",
  outline:
    "bg-[#ad93e6] text-white hover:bg-[#9d7ed9] disabled:opacity-50 disabled:cursor-not-allowed",
  ghost: "text-[#737373] hover:text-[#121212]",
  danger: "bg-[#ef4343] text-white hover:bg-[#d63e3e]",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-8 w-8 p-0",
};

const Button = memo(function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;

import { memo } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const BackLink = memo(function BackLink({ to, label, className }) {
  return (
    <Link
      to={to}
      className={cn(
        "mb-6 inline-flex items-center gap-1 text-sm text-[#737373] transition-colors hover:text-[#121212]",
        className,
      )}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label}
    </Link>
  );
});

export default BackLink;

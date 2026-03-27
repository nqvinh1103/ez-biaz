import { memo } from "react";
import { cn } from "../../utils/cn";

const CONTROL_BASE =
  "w-full rounded-lg border border-[#e6e6e6] bg-white text-sm text-[#121212] placeholder-[#b3b3b3] outline-none transition-colors focus:border-[#ad93e6] focus:ring-2 focus:ring-[rgba(173,147,230,0.2)]";

const FormField = memo(function FormField({
  label,
  id,
  as: Tag = "input",
  wrapperClassName,
  className,
  children,
  ...rest
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[#737373]">
          {label}
        </label>
      )}

      <Tag
        id={id}
        className={cn(
          CONTROL_BASE,
          Tag === "input" && "h-10 px-4",
          Tag === "select" && "h-10 appearance-none px-4 pr-8 cursor-pointer",
          Tag === "textarea" && "resize-none px-4 py-3",
          className,
        )}
        {...rest}
      >
        {children}
      </Tag>
    </div>
  );
});

export default FormField;

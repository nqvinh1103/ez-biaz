import { memo, useCallback } from "react";
import { cn } from "../../utils/cn";
import { ITEM_TYPES } from "./itemTypes";

const ItemTypeSelector = memo(function ItemTypeSelector({
  selected,
  onChange,
}) {
  const toggle = useCallback(
    (type) => {
      onChange(
        selected.includes(type)
          ? selected.filter((t) => t !== type)
          : [...selected, type],
      );
    },
    [selected, onChange],
  );

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Item type">
      {ITEM_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => toggle(type)}
          aria-pressed={selected.includes(type)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
            selected.includes(type)
              ? "border-[#ad93e6] bg-[#ad93e6] text-white"
              : "border-[#e6e6e6] bg-white text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]",
          )}
        >
          {type}
        </button>
      ))}
    </div>
  );
});

export default ItemTypeSelector;

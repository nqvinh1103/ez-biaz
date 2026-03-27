import { memo } from "react";
import { cn } from "../../utils/cn";

const UploadIcon = () => (
  <svg
    className="h-7 w-7 text-[#737373]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
    />
  </svg>
);

const RemoveIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const AddMoreIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/**
 * Drag-and-drop / click-to-browse image uploader.
 * Displays thumbnail previews with remove buttons.
 *
 * @param {{
 *   previews: string[],
 *   isDragging: boolean,
 *   inputRef: React.RefObject,
 *   maxFiles: number,
 *   onAddFiles: (FileList) => void,
 *   onRemove: (index: number) => void,
 *   onOpenPicker: () => void,
 *   dragHandlers: object,
 * }} props
 */
const PhotoUploader = memo(function PhotoUploader({
  previews,
  isDragging,
  inputRef,
  maxFiles = 5,
  onAddFiles,
  onRemove,
  onOpenPicker,
  dragHandlers,
}) {
  const hasPreviews = previews.length > 0;
  const canAddMore = previews.length < maxFiles;

  return (
    <div>
      {hasPreviews ? (
        <div className="flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div
              key={url}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#e6e6e6]"
            >
              <img
                src={url}
                alt={`Upload preview ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
                aria-label={`Remove photo ${i + 1}`}
              >
                <RemoveIcon />
              </button>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={onOpenPicker}
              className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-[#ad93e6] text-[#ad93e6] transition-colors hover:bg-[rgba(173,147,230,0.05)]"
              aria-label="Add more photos"
            >
              <AddMoreIcon />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenPicker}
          {...dragHandlers}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 transition-colors",
            isDragging
              ? "border-[#ad93e6] bg-[rgba(173,147,230,0.06)]"
              : "border-[#d4d4d4] hover:border-[#ad93e6] hover:bg-[rgba(173,147,230,0.03)]",
          )}
        >
          <UploadIcon />
          <span className="text-sm font-medium text-[#121212]">
            Drag &amp; drop images here
          </span>
          <span className="text-xs text-[#737373]">
            or click to browse · Up to {maxFiles} photos
          </span>
        </button>
      )}

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onAddFiles(e.target.files)}
        aria-label="Upload product photos"
      />
    </div>
  );
});

export default PhotoUploader;

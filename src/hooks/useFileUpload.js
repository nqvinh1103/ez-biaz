import { useCallback, useRef, useState } from "react";

/**
 * Manages image file selection, preview URLs, and drag-and-drop state.
 *
 * @param {number} [maxFiles=5]
 * @returns {{
 *   previews: string[],
 *   isDragging: boolean,
 *   inputRef: React.RefObject,
 *   addFiles: (FileList | File[]) => void,
 *   removeFile: (index: number) => void,
 *   openPicker: () => void,
 *   dragHandlers: { onDragOver, onDragLeave, onDrop },
 * }}
 */
export function useFileUpload(maxFiles = 5) {
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback(
    (incoming) => {
      const valid = Array.from(incoming)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, maxFiles - previews.length);

      if (!valid.length) return;

      const urls = valid.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...urls].slice(0, maxFiles));
    },
    [previews.length, maxFiles],
  );

  const removeFile = useCallback((index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const dragHandlers = {
    onDragOver: useCallback((e) => {
      e.preventDefault();
      setIsDragging(true);
    }, []),
    onDragLeave: useCallback(() => setIsDragging(false), []),
    onDrop: useCallback(
      (e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
      },
      [addFiles],
    ),
  };

  return { previews, isDragging, inputRef, addFiles, removeFile, openPicker, dragHandlers };
}

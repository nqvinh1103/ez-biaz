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
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback(
    (incoming) => {
      const remaining = maxFiles - files.length;
      const valid = Array.from(incoming)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, remaining);

      if (!valid.length) return;

      const urls = valid.map((f) => URL.createObjectURL(f));
      setFiles((prev) => [...prev, ...valid].slice(0, maxFiles));
      setPreviews((prev) => [...prev, ...urls].slice(0, maxFiles));
    },
    [files.length, maxFiles],
  );

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  return { files, previews, isDragging, inputRef, addFiles, removeFile, openPicker, dragHandlers };
}

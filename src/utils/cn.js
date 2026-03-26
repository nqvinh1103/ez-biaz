/**
 * Lightweight className merger — filters falsy values and joins the rest.
 * Covers the most common clsx use-cases without an extra dependency.
 *
 * @param {...(string|undefined|null|false)} classes
 * @returns {string}
 *
 * @example
 * cn("px-4", isActive && "bg-purple", undefined) // "px-4 bg-purple"
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

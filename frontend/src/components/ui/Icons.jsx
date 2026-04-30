/**
 * Inline SVG icons used across the app.
 *
 * Replaces external `figma.com/api/mcp/asset/...` URLs with self-hosted
 * inline SVGs so the app no longer depends on a third-party host being
 * reachable, cacheable, or trustworthy.
 *
 * All icons accept `className` and inherit `currentColor`.
 */

function withProps(props, extra = {}) {
  const { className = "", ...rest } = props;
  return {
    className,
    "aria-hidden": rest["aria-hidden"] ?? true,
    focusable: "false",
    ...extra,
    ...rest,
  };
}

/** → arrow used by "View All" / "See All" links */
export function ArrowRightIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...withProps(props)}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/** Small cart icon used on Add-to-cart buttons */
export function CartIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...withProps(props)}
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4.5h2.2a1 1 0 0 1 .98.8l1.5 8.2a1 1 0 0 0 .98.8h8.5a1 1 0 0 0 .96-.72l1.4-4.95a1 1 0 0 0-.96-1.28H7.2" />
    </svg>
  );
}

/** Close × icon used by modals */
export function CloseIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...withProps(props)}
    >
      <path d="M6 6l12 12M6 18 18 6" />
    </svg>
  );
}

/** Sparkle decoration used on the hero badge */
export function SparkleIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...withProps(props)}
    >
      <path d="M12 2.25 13.5 8 19.5 9.5 13.5 11 12 16.75 10.5 11 4.5 9.5 10.5 8 12 2.25Zm6.5 11 .9 3.1 3.1.9-3.1.9-.9 3.1-.9-3.1L14.5 17l3.1-.9.9-3.1Z" />
    </svg>
  );
}

/** Clock icon used on auction "Place Bid" button */
export function ClockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...withProps(props)}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/** Flame icon used on auction-card timer badge */
export function FlameIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...withProps(props)}
    >
      <path d="M13.5 2.5c.5 3-1.5 4-3 6.5-1.7 2.7-1 5.7 1.4 7.4-.9-2 .3-3.6 1.6-4.5.6 2.4 2.5 3.6 4.5 3.6 0 4-3.6 6-7 6-3.7 0-7-2.5-7-6.6 0-2.7 1.4-4.7 3.3-6.4C8.7 6.7 11 5.6 11.5 2.5c.4 1.2 1 2.1 2 0Z" />
    </svg>
  );
}

/** Google "G" colored mark for social-login buttons */
export function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...withProps(props)}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5c-2 1.5-4.6 2.5-7.5 2.5-5.3 0-9.7-3.4-11.3-8L6.1 32C9.5 38.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.5c-.5.4 6.6-4.7 6.6-15.2 0-1.3-.1-2.3-.5-3.5Z" />
    </svg>
  );
}

/** Facebook "f" mark for social-login buttons */
export function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...withProps(props)}>
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.6 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"
      />
    </svg>
  );
}

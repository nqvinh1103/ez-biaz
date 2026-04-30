/**
 * Tiny pub/sub for auth lifecycle events that originate outside of React
 * (e.g. axios response interceptors). React subscribes from AuthProvider.
 *
 * Events:
 *   - "expired": the server returned 401 on a non-auth endpoint, so the
 *     persisted token was cleared. UI should navigate to "/" and re-prompt.
 */
const listeners = new Map();

function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}

function emit(event, payload) {
  listeners.get(event)?.forEach((h) => {
    try {
      h(payload);
    } catch (err) {
      if (typeof console !== "undefined") console.error("[authEvents]", err);
    }
  });
}

export const authEvents = { on, emit };

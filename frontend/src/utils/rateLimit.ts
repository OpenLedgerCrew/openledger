import { toast } from "sonner";

export const RATE_LIMIT_MESSAGE = "Rate limit reached. Retrying shortly...";

type Listener = (active: boolean) => void;
const listeners = new Set<Listener>();
let timeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Triggers a global top alert and toast notification when HTTP 429 is encountered.
 */
export function triggerRateLimitAlert() {
  toast.warning(RATE_LIMIT_MESSAGE, {
    id: "rate-limit-warning",
    duration: 5000,
    position: "top-center",
  });

  listeners.forEach((fn) => fn(true));
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    listeners.forEach((fn) => fn(false));
  }, 5000);
}

/**
 * Allows top-level components (such as a top banner in App.tsx) to subscribe
 * to rate limit alert states.
 */
export function subscribeRateLimit(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

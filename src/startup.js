import { api } from "./api.js";

function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const cancel = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, ms);
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

// Only bootstrap reads may retry. Never replay login, game creation or credits.
export async function startupRead(action, signal) {
  if (!["status", "categories", "rooms"].includes(action))
    throw new Error("Unsupported startup read");
  const delays = [600, 1500];
  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted();
    try {
      return await api(action, undefined, undefined, { signal });
    } catch (error) {
      const temporary =
        ["CONNECTION_FAILED", "CONNECTION_TIMEOUT"].includes(error.code) ||
        [502, 503, 504].includes(error.status);
      if (signal?.aborted || !temporary || attempt === delays.length)
        throw error;
      await pause(delays[attempt], signal);
    }
  }
}

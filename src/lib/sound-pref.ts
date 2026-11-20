const KEY = "career-muted";

type Listener = (muted: boolean) => void;
const listeners = new Set<Listener>();

export function readSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSoundMuted(muted: boolean) {
  try {
    window.localStorage.setItem(KEY, muted ? "1" : "0");
  } catch {
    // Private mode can reject storage. The in-memory listeners still update.
  }
  listeners.forEach((listener) => listener(muted));
}

export function subscribeSoundMuted(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) listeners.forEach((listener) => listener(event.newValue === "1"));
  });
}

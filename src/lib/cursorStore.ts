import { useCallback, useSyncExternalStore } from 'react';

/**
 * A tiny external store for the cursor label.
 * Components can set the label without causing the rest of the app to re-render;
 * only the CustomCursor subscribes to it.
 */
type Listener = () => void;

let label: string | null = null;
const listeners = new Set<Listener>();

export const cursorStore = {
  get: () => label,
  set: (next: string | null) => {
    if (next === label) return;
    label = next;
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useCursorLabel() {
  return useSyncExternalStore(cursorStore.subscribe, cursorStore.get, cursorStore.get);
}

export function useCursorTarget(text: string) {
  const onMouseEnter = useCallback(() => cursorStore.set(text), [text]);
  const onMouseLeave = useCallback(() => cursorStore.set(null), []);
  return { onMouseEnter, onMouseLeave };
}

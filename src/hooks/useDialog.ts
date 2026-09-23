import { useEffect, useRef, type RefObject } from 'react';

let lockCount = 0;

function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  }
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}

/** Scroll lock, Escape to close, initial focus and focus restore for overlays. */
export function useDialog(
  open: boolean,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement>,
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => initialFocus?.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

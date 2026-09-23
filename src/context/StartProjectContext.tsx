import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NeedId } from '../data/services';

interface Value {
  isOpen: boolean;
  preset: NeedId | null;
  openRequest: (preset?: NeedId) => void;
  closeRequest: () => void;
}

const Ctx = createContext<Value | null>(null);

export function StartProjectProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<NeedId | null>(null);

  const openRequest = useCallback((p?: NeedId) => {
    setPreset(p ?? null);
    setIsOpen(true);
  }, []);
  const closeRequest = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, preset, openRequest, closeRequest }), [isOpen, preset, openRequest, closeRequest]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStartProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStartProject must be used inside <StartProjectProvider>');
  return ctx;
}

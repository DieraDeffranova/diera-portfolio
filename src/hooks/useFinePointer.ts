import { useEffect, useState } from 'react';

const QUERY = '(hover: hover) and (pointer: fine)';

/** True on devices with a precise, hover-capable pointer (mouse / trackpad). */
export function useFinePointer() {
  const [fine, setFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setFine(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return fine;
}

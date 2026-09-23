import { useCallback, useEffect, useState } from 'react';

/**
 * Minimal routing for project pages via `?project=slug`.
 * Works on any static host (no server rewrites needed) and supports the back button.
 */
const read = () => new URLSearchParams(window.location.search).get('project');

export function useProjectRoute() {
  const [slug, setSlug] = useState<string | null>(read);

  useEffect(() => {
    const onPop = () => setSlug(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openProject = useCallback((next: string, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set('project', next);
    url.hash = '';
    const state = { project: next, fromSite: true };
    if (replace) window.history.replaceState(state, '', url);
    else window.history.pushState(state, '', url);
    setSlug(next);
  }, []);

  const closeProject = useCallback(() => {
    if (window.history.state?.fromSite) {
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    window.history.replaceState(null, '', url);
    setSlug(null);
  }, []);

  return { slug, openProject, closeProject };
}

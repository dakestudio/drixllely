import { useState, useEffect } from 'react';

/**
 * Subscribes to a CSS media query and re-renders when it changes.
 * Reads the initial value synchronously so the first paint is already correct.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

/**
 * Parallax and other scroll-driven effects are reserved for pointer devices:
 * on touch screens the inertial scroll makes them jump and they cost a lot of
 * GPU time for an effect that barely reads on a narrow viewport.
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');

/** Honours the OS-level "reduce motion" accessibility setting. */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

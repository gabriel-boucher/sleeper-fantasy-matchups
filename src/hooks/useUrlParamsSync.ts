import { useEffect, useRef } from 'react';
import { UrlParam, updateUrlParams } from '../utils/urlParams';

// Keeps some URL params in step with a component's selections. The first write only tidies the URL
// a component was opened with, so it replaces the history entry; later writes come from the user
// changing something, so each one gets its own Back step.
export function useUrlParamsSync(params: Partial<Record<UrlParam, string | null>>): void {
  const isFirstWrite = useRef(true);
  // Compared as text so a new object with the same values doesn't write again
  const serialized = JSON.stringify(params);

  useEffect(() => {
    updateUrlParams(JSON.parse(serialized), { push: !isFirstWrite.current });
    isFirstWrite.current = false;
  }, [serialized]);
}

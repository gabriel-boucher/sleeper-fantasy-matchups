import { useEffect, useRef } from 'react';
import { UrlParamUpdates, updateUrlParams } from '../utils/urlParams';

export function useUrlParamsSync(params: UrlParamUpdates): void {
  const isFirstWrite = useRef(true);
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    updateUrlParams(JSON.parse(serializedParams), { addHistoryEntry: !isFirstWrite.current });
    isFirstWrite.current = false;
  }, [serializedParams]);
}

import { useState } from 'react';
import { SERIES, SERIES_KEYS_HIDEABLE_ACROSS_VISITS, SeriesKey } from '../constants/weeklyChartSeries';
import { useStoredSet } from './useStoredSet';

const HIDDEN_SERIES_STORAGE_KEY = 'weeklyChart.hiddenLines';

function useMedianShownUntilSwitchFlips(isMedianCounted: boolean) {
  const [isMedianShown, setIsMedianShown] = useState(isMedianCounted);
  const [lastSeenSwitch, setLastSeenSwitch] = useState(isMedianCounted);

  if (lastSeenSwitch !== isMedianCounted) {
    setLastSeenSwitch(isMedianCounted);
    setIsMedianShown(isMedianCounted);
  }

  return [isMedianShown, () => setIsMedianShown(shown => !shown)] as const;
}

export function useShownChartSeries(isMedianCounted: boolean) {
  const { keys: hiddenKeys, toggle: toggleHidden } = useStoredSet(HIDDEN_SERIES_STORAGE_KEY, SERIES_KEYS_HIDEABLE_ACROSS_VISITS);
  const [isMedianShown, toggleMedian] = useMedianShownUntilSwitchFlips(isMedianCounted);

  const isSwitchedOn = (key: SeriesKey) => (key === 'median' ? isMedianShown : !hiddenKeys.has(key));
  const isEverySeriesSwitchedOff = !SERIES.some(series => isSwitchedOn(series.key));
  const isShown = (key: SeriesKey) => isSwitchedOn(key) || (key === 'team' && isEverySeriesSwitchedOff);

  function toggleSeries(key: SeriesKey) {
    if (key === 'median') toggleMedian();
    else toggleHidden(key);
  }

  return { shownSeries: SERIES.filter(series => isShown(series.key)), isShown, toggleSeries };
}

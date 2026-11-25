import { useMemo, useState } from 'react';
import { isCustomized, resolveSettings, toOverrides } from '../domain/leagueSettings';
import { LeagueSettings, LeagueSettingsOverrides, Season } from '../types/models';
import { readStoredJson, writeStoredJson } from '../utils/storage';

const STORAGE_PREFIX = 'league-settings-v1:';

export interface LeagueSettingsState {
  settings: LeagueSettings;
  defaultSettings: LeagueSettings;
  isCustomized: boolean;
  apply: (settings: LeagueSettings) => void;
  reset: () => void;
}

interface StoredOverrides {
  leagueId: string;
  overrides: LeagueSettingsOverrides | null;
}

function readOverrides(leagueId: string): StoredOverrides {
  return { leagueId, overrides: readStoredJson<LeagueSettingsOverrides>(STORAGE_PREFIX + leagueId) };
}

export function useLeagueSettings(season: Season | null): LeagueSettingsState | null {
  const leagueId = season?.leagueId ?? null;
  const defaultSettings = season?.defaultSettings ?? null;
  const [stored, setStored] = useState<StoredOverrides | null>(() => (leagueId ? readOverrides(leagueId) : null));
  if (leagueId && stored?.leagueId !== leagueId) setStored(readOverrides(leagueId));

  const overrides = stored?.leagueId === leagueId ? stored.overrides : null;
  const settings = useMemo(
    () => (defaultSettings ? resolveSettings(defaultSettings, overrides) : null),
    [defaultSettings, overrides]
  );

  if (!leagueId || !defaultSettings || !settings) return null;

  function store(next: LeagueSettingsOverrides) {
    writeStoredJson(STORAGE_PREFIX + leagueId, next);
    setStored({ leagueId: leagueId!, overrides: next });
  }

  return {
    settings,
    defaultSettings,
    isCustomized: isCustomized(settings, defaultSettings),
    apply: next => store(toOverrides(next, defaultSettings)),
    reset: () => store({})
  };
}

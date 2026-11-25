import { ReactNode } from 'react';
import { useLeagueSettings } from '../hooks/useLeagueSettings';
import { Season } from '../types/models';
import { LeagueSettingsContext } from './leagueSettingsContext';

interface LeagueSettingsProviderProps {
  season: Season | null;
  children: ReactNode;
}

export function LeagueSettingsProvider({ season, children }: LeagueSettingsProviderProps) {
  const leagueSettings = useLeagueSettings(season);
  return <LeagueSettingsContext.Provider value={leagueSettings}>{children}</LeagueSettingsContext.Provider>;
}

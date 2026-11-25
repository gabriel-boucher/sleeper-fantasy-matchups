import { createContext, useContext } from 'react';
import { LeagueSettingsState } from '../hooks/useLeagueSettings';

export const LeagueSettingsContext = createContext<LeagueSettingsState | null>(null);

export function useLeagueSettingsContext(): LeagueSettingsState | null {
  return useContext(LeagueSettingsContext);
}

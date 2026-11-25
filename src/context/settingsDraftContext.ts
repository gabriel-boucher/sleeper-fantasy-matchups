import { createContext, useContext } from 'react';
import { LeagueSettingsDraftState } from '../hooks/useLeagueSettingsDraft';

export const SettingsDraftContext = createContext<LeagueSettingsDraftState | null>(null);

export function useSettingsDraftContext(): LeagueSettingsDraftState {
  const draft = useContext(SettingsDraftContext);
  if (!draft) throw new Error('useSettingsDraftContext must be used inside a SettingsDraftProvider');
  return draft;
}

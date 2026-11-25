import { createContext, useContext } from 'react';
import { LeagueSettingsDraft } from '../hooks/useLeagueSettingsDraft';

export const SettingsDraftContext = createContext<LeagueSettingsDraft | null>(null);

export function useSettingsDraft(): LeagueSettingsDraft {
  const draft = useContext(SettingsDraftContext);
  if (!draft) throw new Error('useSettingsDraft must be used inside a SettingsDraftContext provider');
  return draft;
}

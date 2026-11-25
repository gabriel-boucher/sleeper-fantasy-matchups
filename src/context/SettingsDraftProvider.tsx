import { ReactNode } from 'react';
import { useLeagueSettingsDraft } from '../hooks/useLeagueSettingsDraft';
import { LeagueSettings } from '../types/models';
import { SettingsDraftContext } from './settingsDraftContext';

interface SettingsDraftProviderProps {
  settings: LeagueSettings;
  defaultSettings: LeagueSettings;
  editableKeys: string[];
  children: ReactNode;
}

export function SettingsDraftProvider({ settings, defaultSettings, editableKeys, children }: SettingsDraftProviderProps) {
  const draft = useLeagueSettingsDraft(settings, defaultSettings, editableKeys);
  return <SettingsDraftContext.Provider value={draft}>{children}</SettingsDraftContext.Provider>;
}

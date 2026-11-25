import { useState } from 'react';
import { LeagueSettings, ScoringSettings } from '../types/models';

type ScoringInputs = Record<string, string>;

export interface LeagueSettingsDraftState {
  defaultSettings: LeagueSettings;
  hasMedianGame: boolean;
  isMedianGameChanged: boolean;
  setHasMedianGame: (hasMedianGame: boolean) => void;
  restoreMedianGame: () => void;
  getInput: (key: string) => string;
  getValue: (key: string) => number | null;
  getDefaultValue: (key: string) => number;
  isChanged: (key: string) => boolean;
  setInput: (key: string, input: string) => void;
  restore: (key: string) => void;
  hasInvalidValue: boolean;
  resetToDefaults: () => void;
  toSettings: () => LeagueSettings | null;
}

function toInputs(scoring: ScoringSettings, keys: string[]): ScoringInputs {
  return Object.fromEntries(keys.map(key => [key, String(scoring[key] ?? 0)]));
}

function parseInput(input: string): number | null {
  if (input.trim() === '') return null;
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useLeagueSettingsDraft(settings: LeagueSettings, defaultSettings: LeagueSettings, keys: string[]): LeagueSettingsDraftState {
  const [hasMedianGame, setHasMedianGame] = useState(settings.hasMedianGame);
  const [inputs, setInputs] = useState(() => toInputs(settings.scoring, keys));

  const values = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, parseInput(input)]));
  const hasInvalidValue = Object.values(values).some(value => value === null);
  const getDefaultValue = (key: string) => defaultSettings.scoring[key] ?? 0;
  const setInput = (key: string, input: string) => setInputs(current => ({ ...current, [key]: input }));

  return {
    defaultSettings,
    hasMedianGame,
    isMedianGameChanged: hasMedianGame !== defaultSettings.hasMedianGame,
    setHasMedianGame,
    restoreMedianGame: () => setHasMedianGame(defaultSettings.hasMedianGame),
    getInput: key => inputs[key],
    getValue: key => values[key],
    getDefaultValue,
    isChanged: key => values[key] !== getDefaultValue(key),
    setInput,
    restore: key => setInput(key, String(getDefaultValue(key))),
    hasInvalidValue,
    resetToDefaults: () => {
      setHasMedianGame(defaultSettings.hasMedianGame);
      setInputs(toInputs(defaultSettings.scoring, keys));
    },
    toSettings: () => {
      if (hasInvalidValue) return null;
      const scoring = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value ?? 0]));
      return { scoring: { ...defaultSettings.scoring, ...scoring }, hasMedianGame };
    }
  };
}

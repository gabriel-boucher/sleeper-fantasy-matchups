import { LeagueSettings, LeagueSettingsOverrides, ScoringSettings } from '../types/models';

export function resolveSettings(defaults: LeagueSettings, overrides: LeagueSettingsOverrides | null): LeagueSettings {
  return {
    scoring: { ...defaults.scoring, ...overrides?.scoring },
    hasMedianGame: overrides?.hasMedianGame ?? defaults.hasMedianGame
  };
}

export function toOverrides(settings: LeagueSettings, defaults: LeagueSettings): LeagueSettingsOverrides {
  const changes = getScoringChanges(settings.scoring, defaults.scoring);
  const scoring = Object.fromEntries(Object.keys(changes).map(key => [key, settings.scoring[key] ?? 0]));
  return {
    ...(Object.keys(scoring).length > 0 ? { scoring } : {}),
    ...(settings.hasMedianGame !== defaults.hasMedianGame ? { hasMedianGame: settings.hasMedianGame } : {})
  };
}

export function getScoringChanges(scoring: ScoringSettings, defaults: ScoringSettings): ScoringSettings {
  const keys = new Set([...Object.keys(scoring), ...Object.keys(defaults)]);
  return Object.fromEntries(
    [...keys]
      .map(key => [key, (scoring[key] ?? 0) - (defaults[key] ?? 0)] as const)
      .filter(([, delta]) => Math.abs(delta) > Number.EPSILON)
  );
}

export function hasScoringChanges(settings: LeagueSettings, defaults: LeagueSettings): boolean {
  return Object.keys(getScoringChanges(settings.scoring, defaults.scoring)).length > 0;
}

export function isCustomized(settings: LeagueSettings, defaults: LeagueSettings): boolean {
  return settings.hasMedianGame !== defaults.hasMedianGame || hasScoringChanges(settings, defaults);
}

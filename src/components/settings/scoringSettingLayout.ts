import {
  ADVANCED_DEFENSE_GROUP_ID,
  ADVANCED_SETTING_GROUPS,
  CURATED_SCORING_KEYS,
  IDP_GROUP_ID,
  IDP_KEY_PREFIX,
  OTHER_GROUP_TITLE,
  ScoringSettingGroup
} from '../../constants/scoringSettingGroups';
import { ScoringSettings } from '../../types/models';

function toFallbackLabel(key: string): string {
  const words = key.replace(IDP_KEY_PREFIX, '').replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isIdpKey(key: string): boolean {
  return key.startsWith(IDP_KEY_PREFIX);
}

export function getAdvancedGroups(defaults: ScoringSettings): ScoringSettingGroup[] {
  const leagueKeys = new Set(Object.keys(defaults).filter(key => !CURATED_SCORING_KEYS.has(key)));
  const groupedKeys = new Set(getScoringKeys(ADVANCED_SETTING_GROUPS));
  const ungroupedSettings = [...leagueKeys]
    .filter(key => !groupedKeys.has(key))
    .sort()
    .map(key => ({ key, label: toFallbackLabel(key) }));
  const groups = ADVANCED_SETTING_GROUPS.map(group => ({
    ...group,
    settings: [
      ...group.settings.filter(setting => leagueKeys.has(setting.key)),
      ...(group.id === IDP_GROUP_ID ? ungroupedSettings.filter(setting => isIdpKey(setting.key)) : [])
    ]
  }));
  const otherSettings = ungroupedSettings.filter(setting => !isIdpKey(setting.key));
  return [...groups, { id: 'advanced-other', title: OTHER_GROUP_TITLE, settings: otherSettings }]
    .filter(group => group.settings.length > 0);
}

export function getScoringKeys(groups: ScoringSettingGroup[]): string[] {
  return groups.flatMap(group => group.settings.map(setting => setting.key));
}

export function toGridCells(groups: ScoringSettingGroup[]): ScoringSettingGroup[][] {
  const defenseIndex = groups.findIndex(group => group.id === ADVANCED_DEFENSE_GROUP_ID);
  if (defenseIndex === -1 || defenseIndex === groups.length - 1) return groups.map(group => [group]);
  return [...groups.slice(0, defenseIndex + 1).map(group => [group]), groups.slice(defenseIndex + 1)];
}

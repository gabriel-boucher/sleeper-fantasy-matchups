import { CHAMPIONSHIP_PLACE } from '../../constants/playoffs';
import { BracketKind } from '../../domain/playoffs';
import { formatOrdinal } from '../../utils/format';

const ROUND_NAMES_FROM_LAST = ['Championship', 'Semifinals', 'Quarterfinals'];
const PROJECTION_HINT = 'Seeded from the current standings, as if the regular season ended today.';

export const TO_BE_DECIDED = 'To be decided';

export const BRACKET_LABELS: Record<BracketKind, string> = {
  winners: 'Playoffs',
  toiletBowl: 'Toilet bowl'
};

export function getProjectionHint(lastRegularSeasonWeek: number, liveWeek: number | null): string {
  if (liveWeek === null) return PROJECTION_HINT;
  const weeksLeft = lastRegularSeasonWeek - liveWeek + 1;
  return `${PROJECTION_HINT} ${weeksLeft} regular-season ${weeksLeft === 1 ? 'week' : 'weeks'} left, including this one.`;
}

export function getRoundName(round: number, lastRound: number, isToiletBowl: boolean): string {
  const fallbackName = `Round ${round}`;
  if (isToiletBowl) return round === lastRound ? BRACKET_LABELS.toiletBowl : fallbackName;
  return ROUND_NAMES_FROM_LAST[lastRound - round] ?? fallbackName;
}

export function getPlaceLabel(place: number | null, isToiletBowl: boolean, teamCount: number): string | null {
  if (place === null || place === CHAMPIONSHIP_PLACE) return null;
  return `${formatOrdinal(isToiletBowl ? teamCount - place : place)} place`;
}

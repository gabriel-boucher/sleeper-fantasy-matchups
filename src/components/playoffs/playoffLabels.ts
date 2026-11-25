import { CHAMPIONSHIP_PLACE } from '../../constants/playoffs';
import { BracketKind, BracketMode } from '../../domain/playoffs';
import { Season } from '../../types/models';
import { formatOrdinal } from '../../utils/format';

const ROUND_NAMES_FROM_LAST = ['Championship', 'Semifinals', 'Quarterfinals'];
const RESIMULATED_HINT = 'Re-seeded from the standings under your custom league settings, with each game decided by the re-scored points.';
const PROJECTION_HINT = 'Seeded from the current standings, as if the regular season ended today.';

export const TO_BE_DECIDED = 'To be decided';

export const BRACKET_LABELS: Record<BracketKind, string> = {
  winners: 'Playoffs',
  toiletBowl: 'Toilet bowl'
};

const BRACKET_MODE_SUFFIXES: Record<BracketMode, string | null> = {
  recorded: null,
  projected: 'Projected',
  resimulated: 'Custom settings'
};

export function getBracketTitle(mode: BracketMode): string {
  const suffix = BRACKET_MODE_SUFFIXES[mode];
  return suffix ? `${BRACKET_LABELS.winners} — ${suffix}` : BRACKET_LABELS.winners;
}

export function getBracketHint(mode: BracketMode, { lastRegularSeasonWeek, liveWeek }: Season): string | undefined {
  if (mode === 'resimulated') return RESIMULATED_HINT;
  return mode === 'projected' ? getProjectionHint(lastRegularSeasonWeek, liveWeek) : undefined;
}

function getProjectionHint(lastRegularSeasonWeek: number, liveWeek: number | null): string {
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

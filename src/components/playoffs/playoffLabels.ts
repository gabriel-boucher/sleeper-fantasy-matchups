import { CHAMPIONSHIP_PLACE, PLAYOFF_ODDS_RUN_COUNT } from '../../constants/playoffs';
import { BracketKind, BracketMode } from '../../domain/playoffs';
import { Season } from '../../types/models';
import { formatOrdinal } from '../../utils/format';

const ROUND_NAMES_FROM_LAST = ['Championship', 'Semifinals', 'Quarterfinals'];
const RESIMULATED_HINT = 'Re-seeded from the standings under your custom league settings, with each game decided by the re-scored points.';
const SIMULATION_HINT =
  `Estimated from ${PLAYOFF_ODDS_RUN_COUNT.toLocaleString()} simulated seasons, with random scores based on each team's scoring so far. ` +
  'The bracket is seeded by each team\'s average simulated finish. Trades, waiver pickups and injuries aren\'t accounted for.';

export const TO_BE_DECIDED = 'To be decided';

export const BRACKET_LABELS: Record<BracketKind, string> = {
  winners: 'Playoffs',
  toiletBowl: 'Toilet bowl'
};

const PANEL_TITLES: Record<BracketMode, string> = {
  recorded: 'Playoffs',
  projected: 'Playoffs simulation',
  resimulated: 'Playoffs — Custom settings'
};

export function getPlayoffPanelTitle(mode: BracketMode): string {
  return PANEL_TITLES[mode];
}

export function getPlayoffPanelHint(mode: BracketMode, { lastRegularSeasonWeek, liveWeek }: Season): string | undefined {
  if (mode === 'resimulated') return RESIMULATED_HINT;
  return mode === 'projected' ? getSimulationHint(lastRegularSeasonWeek, liveWeek) : undefined;
}

function getSimulationHint(lastRegularSeasonWeek: number, liveWeek: number | null): string {
  if (liveWeek === null) return SIMULATION_HINT;
  const weeksLeft = lastRegularSeasonWeek - liveWeek + 1;
  return `${SIMULATION_HINT} ${weeksLeft} regular-season ${weeksLeft === 1 ? 'week' : 'weeks'} left, including this one.`;
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

import { PlayoffOdds } from '../../domain/playoffOdds';

export interface OddsOutcome {
  label: string;
  getChance: (odds: PlayoffOdds) => number;
}

export interface PlayoffOddsColumn {
  good: OddsOutcome;
  bad: OddsOutcome;
  hint: string;
}

const PAIRED_COLUMNS: PlayoffOddsColumn[] = [
  {
    good: { label: 'Playoffs', getChance: odds => odds.playoffChance },
    bad: { label: 'Toilet bowl', getChance: odds => odds.toiletBowlChance },
    hint: 'Chance of finishing the regular season in a playoff spot, or in the toilet bowl'
  },
  {
    good: { label: 'Bye', getChance: odds => odds.byeChance },
    bad: { label: 'Toilet bye', getChance: odds => odds.toiletBowlByeChance },
    hint: 'Chance of a first-round bye in the playoffs, or in the toilet bowl'
  },
  {
    good: { label: 'Champion', getChance: odds => odds.championChance },
    bad: { label: 'Last', getChance: odds => odds.lastPlaceChance },
    hint: 'Chance of winning the championship, or of finishing the regular season in last place'
  }
];

export const LIKELY_SEED_HEADER = { label: 'Likely seed', hint: 'Most common final seed across the simulations' };

export function getColumnLabel({ good, bad }: PlayoffOddsColumn): string {
  return `${good.label} / ${bad.label}`;
}

export function getShownColumns(odds: PlayoffOdds[]): PlayoffOddsColumn[] {
  return PAIRED_COLUMNS.filter(({ good, bad }) => odds.some(teamOdds => good.getChance(teamOdds) > 0 || bad.getChance(teamOdds) > 0));
}

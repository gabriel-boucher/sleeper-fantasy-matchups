import { useMemo } from 'react';
import { getWeekLineup, WeekLineup } from '../domain/lineup';
import { BestLineupContext, PlayerDirectory, Team } from '../types/models';

export function useWeekLineup(
  team: Team,
  slotNames: string[],
  bestLineupContext: BestLineupContext | null,
  players: PlayerDirectory | null
): WeekLineup | null {
  return useMemo(
    () => (team.roster ? getWeekLineup(team.roster, slotNames, bestLineupContext, players) : null),
    [team.roster, slotNames, bestLineupContext, players]
  );
}

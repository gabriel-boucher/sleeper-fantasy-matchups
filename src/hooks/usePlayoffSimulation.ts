import { useMemo } from 'react';
import { PLAYOFF_ODDS_RANDOM_SEED, PLAYOFF_ODDS_RUN_COUNT } from '../constants/playoffs';
import { PlayoffOdds, simulatePlayoffOdds } from '../domain/playoffOdds';
import { canProjectPlayoffs, PlayoffSeeding } from '../domain/playoffs';
import { Season } from '../types/models';
import { createRandom } from '../utils/random';

export interface PlayoffSimulationState {
  real: PlayoffOdds[];
  allPlay: PlayoffOdds[] | null;
}

function useSimulatedOdds(season: Season, seeding: PlayoffSeeding, isEnabled: boolean): PlayoffOdds[] | null {
  return useMemo(() => {
    if (!isEnabled) return null;
    return simulatePlayoffOdds({ season, seeding, runCount: PLAYOFF_ODDS_RUN_COUNT, random: createRandom(PLAYOFF_ODDS_RANDOM_SEED) });
  }, [season, seeding, isEnabled]);
}

export function usePlayoffSimulation(season: Season, seeding: PlayoffSeeding, isEnabled: boolean): PlayoffSimulationState | null {
  const canSimulate = isEnabled && canProjectPlayoffs(season);
  const real = useSimulatedOdds(season, 'real', canSimulate);
  const allPlay = useSimulatedOdds(season, 'allPlay', canSimulate && seeding === 'allPlay');
  return real && { real, allPlay };
}

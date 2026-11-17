import { useEffect, useRef, useState } from 'react';
import { League } from '../types/models';
import { CLEARED_TEAM_PARAMS, readUrlParam, updateUrlParams } from '../utils/urlParams';

interface LeagueSelection {
  leagueId: string;
  seasonLeagueId: string;
}

const NO_SELECTION: LeagueSelection = { leagueId: '', seasonLeagueId: '' };

function findLeagueByAnySeasonId(leagues: League[], leagueId: string | null): League | undefined {
  return leagues.find(league => league.id === leagueId)
    ?? leagues.find(league => league.seasonsLatestFirst.some(season => season.leagueId === leagueId));
}

function readSelectionFromUrl(leagues: League[]): LeagueSelection {
  const league = findLeagueByAnySeasonId(leagues, readUrlParam('league'));
  if (!league) return NO_SELECTION;

  const linkedSeason = league.seasonsLatestFirst.find(s => s.season === readUrlParam('season'));
  const season = linkedSeason ?? league.seasonsLatestFirst[0];
  return { leagueId: league.id, seasonLeagueId: season.leagueId };
}

function useLeagueSelectionUrlSync(leagues: League[], { leagueId, seasonLeagueId }: LeagueSelection): void {
  const lastWrittenLeagueId = useRef<string | null>(null);

  useEffect(() => {
    const season = leagues.flatMap(league => league.seasonsLatestFirst).find(s => s.leagueId === seasonLeagueId);
    const isFirstWrite = lastWrittenLeagueId.current === null;
    const hasLeagueChanged = !isFirstWrite && lastWrittenLeagueId.current !== leagueId;
    lastWrittenLeagueId.current = leagueId;

    const teamParams = hasLeagueChanged || !season ? CLEARED_TEAM_PARAMS : {};
    updateUrlParams(
      { league: leagueId, season: season?.season ?? null, ...teamParams },
      { addHistoryEntry: !isFirstWrite }
    );
  }, [leagues, leagueId, seasonLeagueId]);
}

export function useLeagueSelection(leagues: League[]) {
  const [selection, setSelection] = useState(() => readSelectionFromUrl(leagues));
  useLeagueSelectionUrlSync(leagues, selection);

  function selectLeague(leagueId: string) {
    const latestSeason = leagues.find(league => league.id === leagueId)?.seasonsLatestFirst[0];
    setSelection({ leagueId, seasonLeagueId: latestSeason?.leagueId ?? '' });
  }

  function selectSeason(seasonLeagueId: string) {
    setSelection(current => ({ ...current, seasonLeagueId }));
  }

  return { ...selection, selectLeague, selectSeason };
}

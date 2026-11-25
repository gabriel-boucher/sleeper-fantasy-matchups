import { useCallback, useState } from 'react';
import { RECORD_TILE_VARIANTS, RecordTileVariant } from '../constants/recordTiles';
import { OWN_SCHEDULE } from '../domain/schedules';
import { findManagedTeam } from '../domain/teams';
import { Matchup, Season, UserId } from '../types/models';
import { readUrlParam } from '../utils/urlParams';
import { TeamSeasonState, useTeamSeason } from './useTeamSeason';
import { useUrlParamsSync } from './useUrlParamsSync';

export const NO_TEAM: UserId = '';

interface SeasonSelectionOptions {
  season: Season;
  liveMatchups: Matchup[];
  searchedUserId: UserId;
}

export interface SeasonSelectionState {
  userId: UserId;
  scheduleOwnerId: UserId;
  teamSeason: TeamSeasonState;
  activeTile: RecordTileVariant | null;
  selectTeam: (userId: UserId) => void;
  selectSchedule: (scheduleOwnerId: UserId) => void;
  selectTile: (tile: RecordTileVariant) => void;
}

function readTeamSelectionFromUrl(season: Season, searchedUserId: UserId) {
  const isInSeason = (id: string | null): id is string => !!id && season.teamUsers.some(user => user.id === id);
  const firstInSeason = (...ids: (string | null)[]) => ids.find(isInSeason);

  const searchedTeamId = findManagedTeam(season, searchedUserId)?.id ?? null;
  const userId = firstInSeason(readUrlParam('team'), searchedTeamId) ?? NO_TEAM;
  const linkedScheduleOwnerId = readUrlParam('vs');
  const canShowLinkedSchedule = userId !== NO_TEAM && isInSeason(linkedScheduleOwnerId) && linkedScheduleOwnerId !== userId;

  return { userId, scheduleOwnerId: canShowLinkedSchedule ? linkedScheduleOwnerId : OWN_SCHEDULE };
}

export function useSeasonSelection({ season, liveMatchups, searchedUserId }: SeasonSelectionOptions): SeasonSelectionState {
  const [initialSelection] = useState(() => readTeamSelectionFromUrl(season, searchedUserId));
  const [userId, setUserId] = useState(initialSelection.userId);
  const [scheduleOwnerId, setScheduleOwnerId] = useState(initialSelection.scheduleOwnerId);
  const [clickedTile, setClickedTile] = useState<RecordTileVariant | null>(null);

  useUrlParamsSync({ team: userId, vs: scheduleOwnerId });

  const teamSeason = useTeamSeason({ season, liveMatchups, userId, scheduleOwnerId });
  const { scheduleRange } = teamSeason;

  function getScheduleShownByTile(tile: RecordTileVariant): UserId {
    if (tile === 'current' || !scheduleRange) return OWN_SCHEDULE;
    const ownerId = scheduleRange[tile].scheduleOwner.id;
    return ownerId === userId ? OWN_SCHEDULE : ownerId;
  }

  const showsCurrentSchedule = (tile: RecordTileVariant) => getScheduleShownByTile(tile) === scheduleOwnerId;
  const activeTile = clickedTile && showsCurrentSchedule(clickedTile)
    ? clickedTile
    : RECORD_TILE_VARIANTS.find(showsCurrentSchedule) ?? null;

  const selectTeam = useCallback((id: UserId) => {
    setUserId(id);
    setScheduleOwnerId(OWN_SCHEDULE);
    setClickedTile(null);
  }, []);

  return {
    userId,
    scheduleOwnerId,
    teamSeason,
    activeTile,
    selectTeam,
    selectSchedule: ownerId => {
      setClickedTile(null);
      setScheduleOwnerId(ownerId);
    },
    selectTile: tile => {
      setClickedTile(tile);
      setScheduleOwnerId(getScheduleShownByTile(tile));
    }
  };
}

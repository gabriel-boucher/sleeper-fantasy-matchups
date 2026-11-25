import { useCallback, useMemo, useState } from 'react';
import { TeamActionsProvider } from '../../context/TeamActionsProvider';
import { OWN_SCHEDULE } from '../../domain/schedules';
import { findManagedTeam } from '../../domain/teams';
import { useMidGameInjuries } from '../../hooks/useMidGameInjuries';
import { useRegularSeason } from '../../hooks/useRegularSeason';
import { useTeamSeason } from '../../hooks/useTeamSeason';
import { useUrlParamsSync } from '../../hooks/useUrlParamsSync';
import { Season, UserId } from '../../types/models';
import { readUrlParam } from '../../utils/urlParams';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import { LineupDialog } from '../lineup/LineupDialog';
import { PlayoffBracket } from '../playoffs/PlayoffBracket';
import { RecordSummary } from '../record/RecordSummary';
import { RECORD_TILE_VARIANTS, RecordTileVariant } from '../record/recordTileVariants';
import { TeamFilters } from './TeamFilters';

interface SeasonContentProps {
  season: Season;
  searchedUserId: UserId;
}

const NO_TEAM: UserId = '';

function readTeamSelectionFromUrl(season: Season, searchedUserId: UserId) {
  const isInSeason = (id: string | null): id is string => !!id && season.teamUsers.some(user => user.id === id);
  const firstInSeason = (...ids: (string | null)[]) => ids.find(isInSeason);

  const searchedTeamId = findManagedTeam(season, searchedUserId)?.id ?? null;
  const userId = firstInSeason(readUrlParam('team'), searchedTeamId) ?? NO_TEAM;
  const linkedScheduleOwnerId = readUrlParam('vs');
  const canShowLinkedSchedule = userId !== NO_TEAM && isInSeason(linkedScheduleOwnerId) && linkedScheduleOwnerId !== userId;

  return { userId, scheduleOwnerId: canShowLinkedSchedule ? linkedScheduleOwnerId : OWN_SCHEDULE };
}

export function SeasonContent({ season: adjustedSeason, searchedUserId }: SeasonContentProps) {
  const { season, liveMatchups, allLiveMatchups } = useRegularSeason(adjustedSeason);

  const [initialSelection] = useState(() => readTeamSelectionFromUrl(season, searchedUserId));
  const [userId, setUserId] = useState(initialSelection.userId);
  const [scheduleOwnerId, setScheduleOwnerId] = useState(initialSelection.scheduleOwnerId);
  const [clickedTile, setClickedTile] = useState<RecordTileVariant | null>(null);
  const [lineupWeek, setLineupWeek] = useState<number | null>(null);

  useUrlParamsSync({ team: userId, vs: scheduleOwnerId });

  const teamSeason = useTeamSeason({ season, liveMatchups, userId, scheduleOwnerId });
  const { matchups, liveMatchup, scheduleRange } = teamSeason;
  const lineupMatchup = [liveMatchup, ...matchups].find(m => m?.week === lineupWeek) ?? null;
  const lineupWeeks = useMemo(() => (lineupWeek === null ? [] : [lineupWeek]), [lineupWeek]);
  const { data: lineupInjuries } = useMidGameInjuries(season, lineupWeeks, lineupMatchup !== null);

  function getScheduleShownByTile(tile: RecordTileVariant): UserId {
    if (tile === 'current' || !scheduleRange) return OWN_SCHEDULE;
    const ownerId = scheduleRange[tile].scheduleOwner.id;
    return ownerId === userId ? OWN_SCHEDULE : ownerId;
  }

  const showsCurrentSchedule = (tile: RecordTileVariant) => getScheduleShownByTile(tile) === scheduleOwnerId;
  const activeTile = clickedTile && showsCurrentSchedule(clickedTile)
    ? clickedTile
    : RECORD_TILE_VARIANTS.find(showsCurrentSchedule) ?? null;

  function selectTile(tile: RecordTileVariant) {
    setClickedTile(tile);
    setScheduleOwnerId(getScheduleShownByTile(tile));
  }

  function selectSchedule(ownerId: UserId) {
    setClickedTile(null);
    setScheduleOwnerId(ownerId);
  }

  const selectTeam = useCallback((id: UserId) => {
    setUserId(id);
    setScheduleOwnerId(OWN_SCHEDULE);
    setClickedTile(null);
  }, []);

  const selectTeamAndCloseLineup = useCallback((id: UserId) => {
    selectTeam(id);
    setLineupWeek(null);
  }, [selectTeam]);

  return (
    <TeamActionsProvider selectTeam={selectTeamAndCloseLineup}>
      <RecordSummary
        teamFilters={
          <TeamFilters
            users={season.teamUsers}
            userId={userId}
            scheduleOwnerId={scheduleOwnerId}
            recordsByScheduleOwner={teamSeason.recordsByScheduleOwner}
            onUserChange={selectTeam}
            onScheduleOwnerChange={selectSchedule}
          />
        }
        userId={userId}
        matchups={userId === NO_TEAM ? null : matchups}
        liveMatchup={liveMatchup}
        onSelectMatchup={matchup => setLineupWeek(matchup.week)}
        ownScheduleRecord={teamSeason.ownScheduleRecord}
        medianRecord={teamSeason.medianRecord}
        weeklyMedians={teamSeason.weeklyMedians}
        scheduleRange={scheduleRange}
        activeTile={activeTile}
        onSelectTile={selectTile}
        footer={<PlayoffBracket season={season} liveMatchups={allLiveMatchups} selectedUserId={userId} />}
      />
      <LeaderboardSection season={season} liveMatchups={liveMatchups} selectedUserId={userId} onSelectUser={selectTeam} />
      {lineupMatchup && (
        <LineupDialog
          matchup={lineupMatchup}
          isLive={lineupMatchup === liveMatchup}
          median={teamSeason.weeklyMedians.get(lineupMatchup.week)}
          weeks={teamSeason.weeksWithMatchupCard}
          onWeekChange={setLineupWeek}
          slotNames={season.startingSlotNames}
          bestLineupContext={season.bestLineupContext}
          players={season.players}
          injuredStarterIds={lineupInjuries?.get(lineupMatchup.week) ?? null}
          showNflTeams={season.isCurrentSeason}
          onClose={() => setLineupWeek(null)}
        />
      )}
    </TeamActionsProvider>
  );
}

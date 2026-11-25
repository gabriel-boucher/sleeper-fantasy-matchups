import { useCallback, useMemo, useState } from 'react';
import { TeamSelectionProvider } from '../../context/TeamSelectionProvider';
import { useMidGameInjuries } from '../../hooks/useMidGameInjuries';
import { useRegularSeason } from '../../hooks/useRegularSeason';
import { NO_TEAM, useSeasonSelection } from '../../hooks/useSeasonSelection';
import { Season, UserId } from '../../types/models';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import { LineupDialog } from '../lineup/LineupDialog';
import { PlayoffPanel } from '../playoffs/PlayoffPanel';
import { RecordSummary } from '../record/RecordSummary';
import { TeamFilters } from './TeamFilters';

interface SeasonContentProps {
  season: Season;
  searchedUserId: UserId;
}

export function SeasonContent({ season: adjustedSeason, searchedUserId }: SeasonContentProps) {
  const { season, liveMatchups, allLiveMatchups } = useRegularSeason(adjustedSeason);
  const { userId, scheduleOwnerId, teamSeason, activeTile, selectTeam, selectSchedule, selectTile } =
    useSeasonSelection({ season, liveMatchups, searchedUserId });
  const [lineupWeek, setLineupWeek] = useState<number | null>(null);

  const { matchups, liveMatchup } = teamSeason;
  const lineupMatchup = [liveMatchup, ...matchups].find(m => m?.week === lineupWeek) ?? null;
  const lineupWeeks = useMemo(() => (lineupWeek === null ? [] : [lineupWeek]), [lineupWeek]);
  const { data: lineupInjuries } = useMidGameInjuries(season, lineupWeeks, lineupMatchup !== null);

  const selectTeamAndCloseLineup = useCallback((id: UserId) => {
    selectTeam(id);
    setLineupWeek(null);
  }, [selectTeam]);

  return (
    <TeamSelectionProvider selectedUserId={userId} selectTeam={selectTeamAndCloseLineup}>
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
        scheduleRange={teamSeason.scheduleRange}
        activeTile={activeTile}
        onSelectTile={selectTile}
      />
      <PlayoffPanel season={season} liveMatchups={allLiveMatchups} />
      <LeaderboardSection season={season} liveMatchups={liveMatchups} />
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
    </TeamSelectionProvider>
  );
}

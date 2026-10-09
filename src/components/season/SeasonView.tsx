import { useEffect, useMemo, useState } from 'react';
import { UserId } from '../../data/data';
import { getMatchupsAgainstSchedule, getMatchupsFor, getScheduleRange, getTeamName } from '../../data/matchupAnalysis';
import { getWeeklyScores } from '../../data/weeklyScores';
import { useLiveMatchups } from '../../hooks/useLiveMatchups';
import { Season } from '../../services/seasonService';
import { readUrlParam, updateUrlParams } from '../../utils/urlParams';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import { RecordSummary } from '../record/RecordSummary';
import { ScheduleRangeSummary } from '../record/ScheduleRangeSummary';
import { TeamFilters } from './TeamFilters';

interface SeasonViewProps {
  season: Season;
  currentUserId: UserId;
}

// Restores the team and schedule from a shared link when they're in this season,
// otherwise starts on the searched user's own team
function getInitialTeams(season: Season, currentUserId: UserId) {
  const isInSeason = (id: string | null): id is string => !!id && season.users.some(u => u.user_id === id);

  const linkedTeam = readUrlParam('team');
  const userId = isInSeason(linkedTeam) ? linkedTeam : isInSeason(currentUserId) ? currentUserId : '';
  const linkedSchedule = readUrlParam('vs');
  const scheduleOwnerId = userId && isInSeason(linkedSchedule) && linkedSchedule !== userId ? linkedSchedule : '';

  return { userId, scheduleOwnerId };
}

export function SeasonView({ season, currentUserId }: SeasonViewProps) {
  const [initial] = useState(() => getInitialTeams(season, currentUserId));
  const [userId, setUserId] = useState(initial.userId);
  const [scheduleOwnerId, setScheduleOwnerId] = useState(initial.scheduleOwnerId);

  useEffect(() => {
    updateUrlParams({ team: userId, vs: scheduleOwnerId });
  }, [userId, scheduleOwnerId]);

  const matchups = useMemo(() => {
    if (!userId) return [];
    return scheduleOwnerId
      ? getMatchupsAgainstSchedule(season.matchups, userId, scheduleOwnerId)
      : getMatchupsFor(season.matchups, userId);
  }, [season.matchups, userId, scheduleOwnerId]);

  const liveMatchups = useLiveMatchups(season);
  const liveMatchup = useMemo(() => {
    if (!userId) return null;
    const forTeam = scheduleOwnerId
      ? getMatchupsAgainstSchedule(liveMatchups, userId, scheduleOwnerId)
      : getMatchupsFor(liveMatchups, userId);
    return forTeam[0] ?? null;
  }, [liveMatchups, userId, scheduleOwnerId]);

  const weeklyScores = useMemo(
    () => (userId ? getWeeklyScores(season.matchups, userId) : []),
    [season.matchups, userId]
  );

  const scheduleRange = useMemo(
    () => (userId ? getScheduleRange(season.matchups, season.users, userId) : null),
    [season.matchups, season.users, userId]
  );

  const scheduleOwner = season.users.find(u => u.user_id === scheduleOwnerId);

  function handleUserChange(id: UserId) {
    setUserId(id);
    setScheduleOwnerId('');
  }

  return (
    <>
      <RecordSummary
        controls={
          <TeamFilters
            users={season.users}
            userId={userId}
            scheduleOwnerId={scheduleOwnerId}
            onUserChange={handleUserChange}
            onScheduleOwnerChange={setScheduleOwnerId}
          />
        }
        matchups={userId ? matchups : null}
        liveMatchup={liveMatchup}
        weeklyScores={weeklyScores}
        scheduleOwnerName={scheduleOwner && getTeamName(scheduleOwner)}
        onSelectOwnSchedule={() => setScheduleOwnerId('')}
      >
        {scheduleRange && (
          <ScheduleRangeSummary range={scheduleRange} userId={userId} onSelectSchedule={setScheduleOwnerId} />
        )}
      </RecordSummary>
      <LeaderboardSection season={season} selectedUserId={userId} onSelectUser={handleUserChange} />
    </>
  );
}

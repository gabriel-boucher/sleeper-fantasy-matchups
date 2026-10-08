import { useMemo, useState } from 'react';
import { UserId } from '../data/data';
import { getMatchupsAgainstSchedule, getMatchupsFor, getTeamName } from '../data/matchupAnalysis';
import { Season } from '../services/seasonService';
import { MatchupList } from './MatchupList';
import { RecordSummary } from './RecordSummary';
import { TeamFilters } from './TeamFilters';

interface SeasonViewProps {
  season: Season;
  currentUserId: UserId;
}

export function SeasonView({ season, currentUserId }: SeasonViewProps) {
  const [userId, setUserId] = useState(() =>
    season.users.some(u => u.user_id === currentUserId) ? currentUserId : ''
  );
  const [scheduleOwnerId, setScheduleOwnerId] = useState('');

  const matchups = useMemo(() => {
    if (!userId) return [];
    return scheduleOwnerId
      ? getMatchupsAgainstSchedule(season.matchups, userId, scheduleOwnerId)
      : getMatchupsFor(season.matchups, userId);
  }, [season.matchups, userId, scheduleOwnerId]);

  const scheduleOwner = season.users.find(u => u.user_id === scheduleOwnerId);

  function handleUserChange(id: UserId) {
    setUserId(id);
    setScheduleOwnerId('');
  }

  return (
    <>
      <TeamFilters
        users={season.users}
        userId={userId}
        scheduleOwnerId={scheduleOwnerId}
        onUserChange={handleUserChange}
        onScheduleOwnerChange={setScheduleOwnerId}
      />
      {userId ? (
        <>
          <RecordSummary matchups={matchups} scheduleOwnerName={scheduleOwner && getTeamName(scheduleOwner)} />
          <MatchupList matchups={matchups} />
        </>
      ) : (
        <p className="empty-state">Pick a team to see its season.</p>
      )}
    </>
  );
}

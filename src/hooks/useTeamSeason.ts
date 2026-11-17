import { useMemo } from 'react';
import { getMatchupsFor, getMedianRecord, getPlayedMatchups, getRecord, getWeeklyMedians } from '../domain/matchups';
import { addRecords, createEmptyRecord, getGamesPlayed } from '../domain/records';
import { getMatchupsOnSchedule, getRecordsOnAllSchedulesBestFirst, getScheduleRange } from '../domain/schedules';
import { getWeeklyScores } from '../domain/weeklyScores';
import { Matchup, Season, TeamRecord, UserId } from '../types/models';

interface TeamSeasonOptions {
  season: Season;
  liveMatchups: Matchup[];
  userId: UserId;
  scheduleOwnerId: UserId;
  isMedianCounted: boolean;
}

export function useTeamSeason({ season, liveMatchups, userId, scheduleOwnerId, isMedianCounted }: TeamSeasonOptions) {
  const { completedMatchups, teamUsers, lastRegularSeasonWeek } = season;

  const matchups = useMemo(
    () => (userId ? getMatchupsOnSchedule(completedMatchups, userId, scheduleOwnerId) : []),
    [completedMatchups, userId, scheduleOwnerId]
  );

  const liveMatchup = useMemo(
    () => (userId ? getMatchupsOnSchedule(liveMatchups, userId, scheduleOwnerId)[0] ?? null : null),
    [liveMatchups, userId, scheduleOwnerId]
  );

  const weeksWithMatchupCard = useMemo(
    () => [...getPlayedMatchups(matchups).map(m => m.week), ...(liveMatchup ? [liveMatchup.week] : [])],
    [matchups, liveMatchup]
  );

  const weeklyScores = useMemo(() => getWeeklyScores(completedMatchups, matchups), [completedMatchups, matchups]);

  const medianRecord = useMemo(
    () => (isMedianCounted && userId ? getMedianRecord(completedMatchups, userId, lastRegularSeasonWeek) : createEmptyRecord()),
    [isMedianCounted, completedMatchups, lastRegularSeasonWeek, userId]
  );

  const weeklyMedians = useMemo(
    () => (isMedianCounted
      ? getWeeklyMedians([...completedMatchups, ...liveMatchups], lastRegularSeasonWeek)
      : new Map<number, number>()),
    [isMedianCounted, completedMatchups, liveMatchups, lastRegularSeasonWeek]
  );

  const ownScheduleRecord = useMemo(
    () => addRecords(getRecord(getMatchupsFor(completedMatchups, userId)), medianRecord),
    [completedMatchups, userId, medianRecord]
  );

  const recordsByScheduleOwner = useMemo(() => {
    if (!userId || getGamesPlayed(ownScheduleRecord) === 0) return new Map<UserId, TeamRecord>();
    const records = getRecordsOnAllSchedulesBestFirst(completedMatchups, teamUsers, userId, medianRecord);
    return new Map(records.map(({ scheduleOwner, record }) => [scheduleOwner.id, record]));
  }, [completedMatchups, teamUsers, userId, ownScheduleRecord, medianRecord]);

  const scheduleRange = useMemo(
    () => (userId ? getScheduleRange(completedMatchups, teamUsers, userId, medianRecord) : null),
    [completedMatchups, teamUsers, userId, medianRecord]
  );

  return {
    matchups,
    liveMatchup,
    weeksWithMatchupCard,
    weeklyScores,
    medianRecord,
    weeklyMedians,
    ownScheduleRecord,
    recordsByScheduleOwner,
    scheduleRange
  };
}

import { useMemo } from 'react';
import { getMatchupsFor, getMedianRecord, getPlayedMatchups, getRecord, getWeeklyMedians } from '../domain/matchups';
import { addRecords, createEmptyRecord, getGamesPlayed } from '../domain/records';
import { getMatchupsOnSchedule, getRecordsOnAllSchedulesBestFirst, getScheduleRange, ScheduleRange } from '../domain/schedules';
import { Matchup, Season, TeamRecord, UserId } from '../types/models';

export interface TeamSeasonState {
  matchups: Matchup[];
  liveMatchup: Matchup | null;
  weeksWithMatchupCard: number[];
  medianRecord: TeamRecord;
  weeklyMedians: Map<number, number>;
  ownScheduleRecord: TeamRecord;
  recordsByScheduleOwner: Map<UserId, TeamRecord>;
  scheduleRange: ScheduleRange | null;
}

interface TeamSeasonOptions {
  season: Season;
  liveMatchups: Matchup[];
  userId: UserId;
  scheduleOwnerId: UserId;
}

export function useTeamSeason({ season, liveMatchups, userId, scheduleOwnerId }: TeamSeasonOptions): TeamSeasonState {
  const { completedMatchups, teamUsers, lastRegularSeasonWeek, hasMedianGame } = season;

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

  const medianRecord = useMemo(
    () => (hasMedianGame && userId ? getMedianRecord(completedMatchups, userId, lastRegularSeasonWeek) : createEmptyRecord()),
    [hasMedianGame, completedMatchups, lastRegularSeasonWeek, userId]
  );

  const weeklyMedians = useMemo(
    () => (hasMedianGame
      ? getWeeklyMedians([...completedMatchups, ...liveMatchups], lastRegularSeasonWeek)
      : new Map<number, number>()),
    [hasMedianGame, completedMatchups, liveMatchups, lastRegularSeasonWeek]
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
    medianRecord,
    weeklyMedians,
    ownScheduleRecord,
    recordsByScheduleOwner,
    scheduleRange
  };
}

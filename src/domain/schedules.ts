import { Matchup, TeamRecord, User, UserId } from '../types/models';
import { getMatchupsFor, getRecord } from './matchups';
import { addRecords, createEmptyRecord, getGamesPlayed, getWinPct } from './records';

export const OWN_SCHEDULE: UserId = '';

export interface ScheduleRecord {
  scheduleOwner: User;
  record: TeamRecord;
}

export interface ScheduleRange {
  best: ScheduleRecord;
  worst: ScheduleRecord;
}

export function getMatchupsOnSchedule(matchups: Matchup[], userId: UserId, scheduleOwnerId: UserId): Matchup[] {
  return scheduleOwnerId === OWN_SCHEDULE || scheduleOwnerId === userId
    ? getMatchupsFor(matchups, userId)
    : getMatchupsAgainstSchedule(matchups, userId, scheduleOwnerId);
}

function getMatchupsAgainstSchedule(matchups: Matchup[], userId: UserId, scheduleOwnerId: UserId): Matchup[] {
  const scheduleByWeek = new Map(getMatchupsFor(matchups, scheduleOwnerId).map(m => [m.week, m]));

  return getMatchupsFor(matchups, userId).map(m => {
    const scheduled = scheduleByWeek.get(m.week);
    if (!scheduled) return m;
    const playedEachOther = scheduled.opponent.user.id === userId;
    return { ...m, opponent: playedEachOther ? scheduled.team : scheduled.opponent };
  });
}

export function getRecordsOnAllSchedulesBestFirst(
  matchups: Matchup[],
  users: User[],
  userId: UserId,
  medianRecord: TeamRecord = createEmptyRecord()
): ScheduleRecord[] {
  return users
    .map(scheduleOwner => ({
      scheduleOwner,
      record: addRecords(getRecord(getMatchupsOnSchedule(matchups, userId, scheduleOwner.id)), medianRecord)
    }))
    .sort((a, b) => getWinPct(b.record) - getWinPct(a.record));
}

export function getScheduleRange(
  matchups: Matchup[],
  users: User[],
  userId: UserId,
  medianRecord?: TeamRecord
): ScheduleRange | null {
  const records = getRecordsOnAllSchedulesBestFirst(matchups, users, userId, medianRecord);
  if (records.length === 0 || getGamesPlayed(records[0].record) === 0) return null;
  return { best: records[0], worst: records[records.length - 1] };
}

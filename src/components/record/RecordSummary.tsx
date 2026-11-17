import { ReactNode } from 'react';
import { getPlayedMatchups, getRecord } from '../../domain/matchups';
import { getTotalProjection } from '../../domain/projections';
import { addRecords, getWinPct } from '../../domain/records';
import { ScheduleRange } from '../../domain/schedules';
import { WeeklyScore } from '../../domain/weeklyScores';
import { Matchup, TeamRecord, UserId } from '../../types/models';
import { formatPercent, formatPoints } from '../../utils/format';
import { MatchupList } from '../matchups/MatchupList';
import { RecordTile } from './RecordTile';
import { RecordTileVariant } from './recordTileVariants';
import { ScheduleRangeSummary } from './ScheduleRangeSummary';
import { WeeklyScoreChart } from './WeeklyScoreChart';
import './RecordSummary.css';

interface RecordDetailsProps {
  userId: UserId;
  matchups: Matchup[];
  liveMatchup: Matchup | null;
  onSelectMatchup: (matchup: Matchup) => void;
  weeklyScores: WeeklyScore[];
  ownScheduleRecord: TeamRecord;
  medianRecord: TeamRecord;
  weeklyMedians: Map<number, number>;
  isMedianCounted: boolean;
  scheduleRange: ScheduleRange | null;
  activeTile: RecordTileVariant | null;
  onSelectTile: (tile: RecordTileVariant) => void;
}

interface RecordSummaryProps extends Omit<RecordDetailsProps, 'matchups'> {
  teamFilters: ReactNode;
  medianToggle: ReactNode;
  matchups: Matchup[] | null;
}

export function RecordSummary({ teamFilters, medianToggle, matchups, ...detailsProps }: RecordSummaryProps) {
  return (
    <section className="panel record-summary">
      <div className="record-summary-header">
        <h2 className="section-title">Season record</h2>
        {medianToggle}
      </div>

      <div className="record-summary-controls">{teamFilters}</div>

      {matchups
        ? <RecordDetails matchups={matchups} {...detailsProps} />
        : <p className="empty-state">Pick a team to see its season.</p>}
    </section>
  );
}

function RecordDetails({
  userId,
  matchups,
  liveMatchup,
  onSelectMatchup,
  weeklyScores,
  ownScheduleRecord,
  medianRecord,
  weeklyMedians,
  isMedianCounted,
  scheduleRange,
  activeTile,
  onSelectTile
}: RecordDetailsProps) {
  const shownScheduleRecord = addRecords(getRecord(matchups), medianRecord);
  const projectedPoints = getTotalProjection(getPlayedMatchups(matchups));

  return (
    <>
      <div className="record-row">
        <RecordTile
          label="Current record"
          variant="current"
          record={ownScheduleRecord}
          isActive={activeTile === 'current'}
          onClick={() => onSelectTile('current')}
        />
        {scheduleRange && (
          <ScheduleRangeSummary range={scheduleRange} userId={userId} activeTile={activeTile} onSelectTile={onSelectTile} />
        )}
      </div>

      <MatchupList
        matchups={matchups}
        liveMatchup={liveMatchup}
        weeklyMedians={weeklyMedians}
        onSelectMatchup={onSelectMatchup}
        headerContent={
          <dl className="season-stats">
            <Stat label="W%" value={formatPercent(getWinPct(shownScheduleRecord))} />
            <Stat label="PF" value={formatPoints(shownScheduleRecord.pointsFor)} />
            <Stat label="PA" value={formatPoints(shownScheduleRecord.pointsAgainst)} />
            {projectedPoints !== null && <Stat label="PROJ" value={formatPoints(projectedPoints)} />}
          </dl>
        }
      />

      {weeklyScores.length > 0 && <WeeklyScoreChart scores={weeklyScores} isMedianCounted={isMedianCounted} />}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="season-stat">
      <dt className="season-stat-label">{label}</dt>
      <dd className="season-stat-value">{value}</dd>
    </div>
  );
}

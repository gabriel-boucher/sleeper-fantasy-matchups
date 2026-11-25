import { ReactNode } from 'react';
import { getPlayedMatchups, getRecord } from '../../domain/matchups';
import { getTotalProjection } from '../../domain/projections';
import { addRecords } from '../../domain/records';
import { ScheduleRange } from '../../domain/schedules';
import { Matchup, TeamRecord, UserId } from '../../types/models';
import { formatPoints } from '../../utils/format';
import { Panel } from '../common/Panel';
import { MatchupList } from '../matchups/MatchupList';
import { RecordTile } from './RecordTile';
import { RecordTileVariant } from './recordTileVariants';
import { ScheduleRangeSummary } from './ScheduleRangeSummary';
import './RecordSummary.css';

interface RecordDetailsProps {
  userId: UserId;
  matchups: Matchup[];
  liveMatchup: Matchup | null;
  onSelectMatchup: (matchup: Matchup) => void;
  ownScheduleRecord: TeamRecord;
  medianRecord: TeamRecord;
  weeklyMedians: Map<number, number>;
  scheduleRange: ScheduleRange | null;
  activeTile: RecordTileVariant | null;
  onSelectTile: (tile: RecordTileVariant) => void;
}

interface RecordSummaryProps extends Omit<RecordDetailsProps, 'matchups'> {
  teamFilters: ReactNode;
  matchups: Matchup[] | null;
  footer?: ReactNode;
}

export function RecordSummary({ teamFilters, matchups, footer, ...detailsProps }: RecordSummaryProps) {
  return (
    <Panel title="Season record" className="record-summary">
      <div className="record-summary-controls">{teamFilters}</div>

      {matchups
        ? <RecordDetails matchups={matchups} {...detailsProps} />
        : <p className="empty-state">Pick a team to see its season.</p>}

      {footer}
    </Panel>
  );
}

function RecordDetails({
  userId,
  matchups,
  liveMatchup,
  onSelectMatchup,
  ownScheduleRecord,
  medianRecord,
  weeklyMedians,
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
            <Stat label="PF" value={formatPoints(shownScheduleRecord.pointsFor)} />
            <Stat label="PA" value={formatPoints(shownScheduleRecord.pointsAgainst)} />
            {projectedPoints !== null && <Stat label="PROJ" value={formatPoints(projectedPoints)} />}
          </dl>
        }
      />
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

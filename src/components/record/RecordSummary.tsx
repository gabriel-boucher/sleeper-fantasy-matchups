import { ReactNode } from 'react';
import { Matchup } from '../../data/data';
import { getRecord, getWinPct } from '../../data/matchupAnalysis';
import { WeeklyScore } from '../../data/weeklyScores';
import { MatchupList } from '../matchups/MatchupList';
import { RecordTile } from './RecordTile';
import { WeeklyScoreChart } from './WeeklyScoreChart';
import './RecordSummary.css';

interface RecordSummaryProps {
  controls: ReactNode;
  matchups: Matchup[] | null;
  liveMatchup?: Matchup | null;
  // The team's own points each week, which don't depend on the schedule being viewed
  weeklyScores: WeeklyScore[];
  scheduleOwnerName?: string;
  onSelectOwnSchedule: () => void;
  children?: ReactNode;
}

export function RecordSummary({ controls, matchups, ...detailsProps }: RecordSummaryProps) {
  return (
    <section className="panel record-summary">
      <h2 className="section-title">Season record</h2>

      <div className="record-summary-controls">{controls}</div>

      {matchups
        ? <RecordDetails matchups={matchups} {...detailsProps} />
        : <p className="empty-state">Pick a team to see its season.</p>}
    </section>
  );
}

type RecordDetailsProps = Omit<RecordSummaryProps, 'controls' | 'matchups'> & { matchups: Matchup[] };

function RecordDetails({ matchups, liveMatchup, weeklyScores, scheduleOwnerName, onSelectOwnSchedule, children }: RecordDetailsProps) {
  const record = getRecord(matchups);

  return (
    <>
      <div className="record-row">
        <RecordTile
          label="Current record"
          variant="current"
          record={record}
          scheduleOwnerName={scheduleOwnerName}
          onClick={onSelectOwnSchedule}
        />
        {children}
      </div>

      <MatchupList
        matchups={matchups}
        liveMatchup={liveMatchup}
        headerContent={
          <dl className="season-stats">
            <Stat label="W%" value={`${(getWinPct(record) * 100).toFixed(0)}%`} />
            <Stat label="PF" value={record.pointsFor.toFixed(2)} />
            <Stat label="PA" value={record.pointsAgainst.toFixed(2)} />
          </dl>
        }
      />

      {weeklyScores.length > 0 && <WeeklyScoreChart scores={weeklyScores} />}
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

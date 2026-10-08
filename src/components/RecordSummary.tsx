import { ReactNode } from 'react';
import { Matchup } from '../data/data';
import { getPlayedMatchups, getRecord, getResult, getWinPct } from '../data/matchupAnalysis';
import { RecordTile } from './RecordTile';

interface RecordSummaryProps {
  matchups: Matchup[];
  scheduleOwnerName?: string;
  onSelectOwnSchedule: () => void;
  children?: ReactNode;
}

export function RecordSummary({ matchups, scheduleOwnerName, onSelectOwnSchedule, children }: RecordSummaryProps) {
  const record = getRecord(matchups);

  return (
    <section className="panel record-summary">
      <h2 className="section-title">Season record</h2>

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

      <div className="stat-grid">
        <Stat label="Win %" value={`${(getWinPct(record) * 100).toFixed(0)}%`} />
        <Stat label="Points for" value={record.pointsFor.toFixed(2)} />
        <Stat label="Points against" value={record.pointsAgainst.toFixed(2)} />
      </div>

      <ResultStrip matchups={matchups} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function ResultStrip({ matchups }: { matchups: Matchup[] }) {
  const played = getPlayedMatchups(matchups);
  if (played.length === 0) return null;

  return (
    <ol className="result-strip" aria-label="Results by week">
      {played.map(m => {
        const result = getResult(m);
        return (
          <li
            key={m.week}
            className={`result-chip ${result}`}
            title={`Week ${m.week}: ${m.team.points.toFixed(2)} – ${m.opponent.points.toFixed(2)}`}
          >
            <span className="result-chip-week">{m.week}</span>
            <span className="result-chip-letter">{result === 'win' ? 'W' : result === 'loss' ? 'L' : 'T'}</span>
          </li>
        );
      })}
    </ol>
  );
}

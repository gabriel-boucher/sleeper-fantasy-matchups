import { Matchup } from '../data/data';
import { getPlayedMatchups, getRecord, getResult } from '../data/matchupAnalysis';

interface RecordSummaryProps {
  matchups: Matchup[];
  scheduleOwnerName?: string;
}

export function RecordSummary({ matchups, scheduleOwnerName }: RecordSummaryProps) {
  const record = getRecord(matchups);
  const games = record.wins + record.losses + record.ties;
  const winPct = games > 0 ? ((record.wins + record.ties / 2) / games) * 100 : 0;

  return (
    <section className="panel record-summary">
      <div className="record-heading">
        <h2 className="section-title">Season record</h2>
        {scheduleOwnerName && (
          <span className="record-context">Against {scheduleOwnerName}'s schedule</span>
        )}
      </div>

      <dl className="stat-grid">
        <Stat label="Record" value={`${record.wins}–${record.losses}${record.ties ? `–${record.ties}` : ''}`} highlight />
        <Stat label="Win %" value={`${winPct.toFixed(0)}%`} />
        <Stat label="Points for" value={record.pointsFor.toFixed(2)} />
        <Stat label="Points against" value={record.pointsAgainst.toFixed(2)} />
      </dl>

      <ResultStrip matchups={matchups} />
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="stat">
      <dt className="stat-label">{label}</dt>
      <dd className={`stat-value ${highlight ? 'highlight' : ''}`}>{value}</dd>
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

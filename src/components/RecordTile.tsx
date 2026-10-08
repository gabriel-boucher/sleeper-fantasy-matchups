import { formatRecord, TeamRecord } from '../data/matchupAnalysis';

interface RecordTileProps {
  label: string;
  record: TeamRecord;
  // Undefined means the team's own schedule
  scheduleOwnerName?: string;
  variant: 'current' | 'best' | 'worst';
  onClick: () => void;
}

export function RecordTile({ label, record, scheduleOwnerName, variant, onClick }: RecordTileProps) {
  return (
    <button type="button" className={`record-tile ${variant}`} onClick={onClick} title="Show these matchups">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{formatRecord(record)}</span>
      <span className="record-tile-schedule">
        {scheduleOwnerName ? `With ${scheduleOwnerName}'s schedule` : 'With its own schedule'}
      </span>
    </button>
  );
}

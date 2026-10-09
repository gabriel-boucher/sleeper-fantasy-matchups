import { formatRecord, TeamRecord } from '../../data/matchupAnalysis';
import './RecordTile.css';

interface RecordTileProps {
  label: string;
  record: TeamRecord;
  scheduleOwnerName?: string;
  variant: 'current' | 'best' | 'worst';
  onClick: () => void;
}

export function RecordTile({ label, record, scheduleOwnerName, variant, onClick }: RecordTileProps) {
  return (
    <button type="button" className={`record-tile ${variant}`} onClick={onClick} title="Show these matchups">
      <span className="record-tile-label">{label}</span>
      <span className="record-tile-value">{formatRecord(record)}</span>
      <span className="record-tile-schedule">
        {scheduleOwnerName ? `${scheduleOwnerName}'s schedule` : 'Own schedule'}
      </span>
    </button>
  );
}

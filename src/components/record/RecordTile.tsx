import { RecordTileVariant } from '../../constants/recordTiles';
import { formatRecord } from '../../domain/records';
import { TeamRecord } from '../../types/models';
import './RecordTile.css';

interface RecordTileProps {
  label: string;
  record: TeamRecord;
  scheduleOwnerName?: string;
  variant: RecordTileVariant;
  isActive: boolean;
  onClick: () => void;
}

export function RecordTile({ label, record, scheduleOwnerName, variant, isActive, onClick }: RecordTileProps) {
  return (
    <button
      type="button"
      className={`record-tile ${variant} ${isActive ? 'active' : ''}`}
      aria-pressed={isActive}
      onClick={onClick}
      title="Show these matchups"
    >
      <span className="record-tile-label">{label}</span>
      <span className="record-tile-value">{formatRecord(record)}</span>
      <span className="record-tile-schedule">
        {scheduleOwnerName ? `${scheduleOwnerName}'s schedule` : 'Own schedule'}
      </span>
    </button>
  );
}

import { ScheduleRange } from '../../domain/schedules';
import { getTeamName } from '../../domain/teams';
import { UserId } from '../../types/models';
import { RecordTile } from './RecordTile';
import { RecordTileVariant } from './recordTileVariants';
import './ScheduleRangeSummary.css';

interface ScheduleRangeSummaryProps {
  range: ScheduleRange;
  userId: UserId;
  activeTile: RecordTileVariant | null;
  onSelectTile: (tile: RecordTileVariant) => void;
}

const TILE_LABELS = { best: 'Best record', worst: 'Worst record' } as const;

export function ScheduleRangeSummary({ range, userId, activeTile, onSelectTile }: ScheduleRangeSummaryProps) {
  function renderTile(variant: 'best' | 'worst') {
    const { scheduleOwner, record } = range[variant];
    const isOwnSchedule = scheduleOwner.id === userId;
    return (
      <RecordTile
        label={TILE_LABELS[variant]}
        variant={variant}
        record={record}
        scheduleOwnerName={isOwnSchedule ? undefined : getTeamName(scheduleOwner)}
        isActive={activeTile === variant}
        onClick={() => onSelectTile(variant)}
      />
    );
  }

  return (
    <div className="schedule-range">
      {renderTile('best')}
      {renderTile('worst')}
    </div>
  );
}

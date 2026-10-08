import { UserId } from '../data/data';
import { getTeamName, ScheduleRange, ScheduleRecord } from '../data/matchupAnalysis';
import { RecordTile } from './RecordTile';

interface ScheduleRangeSummaryProps {
  range: ScheduleRange;
  userId: UserId;
  onSelectSchedule: (scheduleOwnerId: UserId) => void;
}

export function ScheduleRangeSummary({ range, userId, onSelectSchedule }: ScheduleRangeSummaryProps) {
  function renderTile(label: string, variant: 'best' | 'worst', { scheduleOwner, record }: ScheduleRecord) {
    const isOwnSchedule = scheduleOwner.user_id === userId;
    return (
      <RecordTile
        label={label}
        variant={variant}
        record={record}
        scheduleOwnerName={isOwnSchedule ? undefined : getTeamName(scheduleOwner)}
        onClick={() => onSelectSchedule(isOwnSchedule ? '' : scheduleOwner.user_id)}
      />
    );
  }

  return (
    <div className="schedule-range">
      {renderTile('Best record', 'best', range.best)}
      {renderTile('Worst record', 'worst', range.worst)}
    </div>
  );
}

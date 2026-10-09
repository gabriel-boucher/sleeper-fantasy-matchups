import { User, UserId } from '../../data/data';
import { getTeamName } from '../../data/matchupAnalysis';
import { SelectField, SelectOption } from '../common/SelectField';

interface TeamFiltersProps {
  users: User[];
  userId: UserId;
  scheduleOwnerId: UserId;
  onUserChange: (userId: UserId) => void;
  onScheduleOwnerChange: (userId: UserId) => void;
}

function toOption(user: User): SelectOption {
  return { value: user.user_id, label: getTeamName(user) };
}

export function TeamFilters({ users, userId, scheduleOwnerId, onUserChange, onScheduleOwnerChange }: TeamFiltersProps) {
  return (
    <div className="field-row">
      <SelectField
        id="user-select"
        label="Team"
        value={userId}
        options={users.map(toOption)}
        placeholder="Select a team"
        onChange={onUserChange}
      />
      <SelectField
        id="opponent-select"
        label="Schedule"
        value={scheduleOwnerId}
        options={users.filter(u => u.user_id !== userId).map(toOption)}
        placeholder="Own schedule"
        disabled={!userId}
        onChange={onScheduleOwnerChange}
      />
    </div>
  );
}

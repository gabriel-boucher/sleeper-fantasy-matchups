import { User, UserId } from '../../data/data';
import { getTeamName } from '../../data/matchupAnalysis';
import { SelectField, SelectOption } from '../common/SelectField';
import { UsernameLink } from '../common/TeamLinks';

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
  // Who runs the selected team and the team whose schedule is used, shown on each label's line.
  // "Own schedule" has no one else's name to show.
  const manager = users.find(u => u.user_id === userId);
  const scheduleOwner = users.find(u => u.user_id === scheduleOwnerId);

  return (
    <div className="field-row">
      <SelectField
        id="user-select"
        label="Team"
        value={userId}
        options={users.map(toOption)}
        placeholder="Select a team"
        labelExtra={manager && <ManagedBy user={manager} />}
        onChange={onUserChange}
      />
      <SelectField
        id="opponent-select"
        label="Schedule"
        value={scheduleOwnerId}
        options={users.filter(u => u.user_id !== userId).map(toOption)}
        placeholder="Own schedule"
        disabled={!userId}
        labelExtra={scheduleOwner && <ManagedBy user={scheduleOwner} />}
        onChange={onScheduleOwnerChange}
      />
    </div>
  );
}

function ManagedBy({ user }: { user: User }) {
  return <>Managed by <UsernameLink user={user} /></>;
}

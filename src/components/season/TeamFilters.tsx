import { formatRecord } from '../../domain/records';
import { getTeamName } from '../../domain/teams';
import { TeamRecord, User, UserId } from '../../types/models';
import { ListboxOption } from '../common/Listbox';
import { ListboxField } from '../common/ListboxField';
import { UsernameLink } from '../common/TeamLinks';

interface TeamFiltersProps {
  users: User[];
  userId: UserId;
  scheduleOwnerId: UserId;
  recordsByScheduleOwner: Map<UserId, TeamRecord>;
  onUserChange: (userId: UserId) => void;
  onScheduleOwnerChange: (userId: UserId) => void;
}

export function TeamFilters({ users, userId, scheduleOwnerId, recordsByScheduleOwner, onUserChange, onScheduleOwnerChange }: TeamFiltersProps) {
  const manager = users.find(user => user.id === userId);
  const scheduleOwner = users.find(user => user.id === scheduleOwnerId);

  const formatRecordOnScheduleOf = (ownerId: UserId) => {
    const record = recordsByScheduleOwner.get(ownerId);
    return record && formatRecord(record);
  };
  const toTeamOption = (user: User): ListboxOption => ({ value: user.id, label: getTeamName(user) });
  const toScheduleOption = (user: User): ListboxOption => ({ ...toTeamOption(user), detailInOpenList: formatRecordOnScheduleOf(user.id) });

  return (
    <div className="field-row">
      <ListboxField
        id="user-select"
        label="Team"
        value={userId}
        options={users.map(toTeamOption)}
        promptWhenNothingChosen="Select a team"
        labelExtra={manager && <ManagedBy user={manager} />}
        onChange={onUserChange}
      />
      <ListboxField
        id="opponent-select"
        label="Schedule"
        value={scheduleOwnerId}
        options={users.filter(user => user.id !== userId).map(toScheduleOption)}
        emptyValueOption={{ label: 'Own schedule', detailInOpenList: formatRecordOnScheduleOf(userId) }}
        disabled={!userId}
        labelExtra={scheduleOwner && <ManagedBy user={scheduleOwner} />}
        onChange={onScheduleOwnerChange}
      />
    </div>
  );
}

function ManagedBy({ user }: { user: User }) {
  if (user.managerId === null) return <UsernameLink user={user} />;
  return <>Managed by <UsernameLink user={user} /></>;
}

import { getTeamName } from '../../domain/teams';
import { User } from '../../types/models';
import { TeamNameLink } from './TeamLinks';
import { UserAvatar } from './UserAvatar';

interface TeamIdentityProps {
  user: User;
  nameClassName?: string;
}

export function TeamIdentity({ user, nameClassName }: TeamIdentityProps) {
  return (
    <>
      <UserAvatar url={user.avatarUrl} name={getTeamName(user)} />
      <TeamNameLink user={user} className={nameClassName} />
    </>
  );
}

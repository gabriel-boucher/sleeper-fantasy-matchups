import { Season, User, UserId } from '../types/models';

export function findManagedTeam(season: Season, managerId: UserId): User | undefined {
  const teamId = season.teamIdsByManagerId.get(managerId);
  return season.teamUsers.find(user => user.id === teamId);
}

export function getTeamName(user: User): string {
  return user.teamName?.trim() || getSleeperDefaultTeamName(user);
}

function getSleeperDefaultTeamName(user: User): string {
  return `Team ${user.displayName}`;
}

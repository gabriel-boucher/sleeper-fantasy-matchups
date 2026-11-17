import { User } from '../types/models';

export function getTeamName(user: User): string {
  return user.teamName?.trim() || getSleeperDefaultTeamName(user);
}

function getSleeperDefaultTeamName(user: User): string {
  return `Team ${user.displayName}`;
}

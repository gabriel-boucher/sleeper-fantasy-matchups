import { PlayoffTeam } from '../../domain/playoffs';
import { UserId } from '../../types/models';

export interface BracketDisplay {
  isToiletBowl: boolean;
  showsSeedChanges: boolean;
  selectedUserId?: UserId;
  teamCount: number;
}

export function getSelectedClass(team: PlayoffTeam | null, { selectedUserId }: BracketDisplay): string {
  return team?.user.id === selectedUserId ? 'selected' : '';
}

import { createContext, useContext } from 'react';
import { UserId } from '../types/models';

export interface TeamSelection {
  selectedUserId?: UserId;
  selectTeam?: (userId: UserId) => void;
  switchUser?: (userId: UserId) => void;
}

export const TeamSelectionContext = createContext<TeamSelection>({});

export function useTeamSelectionContext(): TeamSelection {
  return useContext(TeamSelectionContext);
}

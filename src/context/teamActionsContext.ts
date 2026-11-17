import { createContext, useContext } from 'react';
import { UserId } from '../types/models';

export interface TeamActions {
  selectTeam?: (userId: UserId) => void;
  switchUser?: (userId: UserId) => void;
}

export const TeamActionsContext = createContext<TeamActions>({});

export function useTeamActions(): TeamActions {
  return useContext(TeamActionsContext);
}

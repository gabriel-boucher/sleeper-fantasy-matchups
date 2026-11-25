import { ReactNode, useMemo } from 'react';
import { TeamSelection, TeamSelectionContext, useTeamSelectionContext } from './teamSelectionContext';

interface TeamSelectionProviderProps extends TeamSelection {
  children: ReactNode;
}

export function TeamSelectionProvider({ selectedUserId, selectTeam, switchUser, children }: TeamSelectionProviderProps) {
  const inherited = useTeamSelectionContext();
  const selection = useMemo(
    () => ({
      selectedUserId: selectedUserId ?? inherited.selectedUserId,
      selectTeam: selectTeam ?? inherited.selectTeam,
      switchUser: switchUser ?? inherited.switchUser
    }),
    [inherited, selectedUserId, selectTeam, switchUser]
  );
  return <TeamSelectionContext.Provider value={selection}>{children}</TeamSelectionContext.Provider>;
}

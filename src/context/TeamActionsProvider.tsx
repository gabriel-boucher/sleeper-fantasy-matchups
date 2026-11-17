import { ReactNode, useMemo } from 'react';
import { TeamActions, TeamActionsContext, useTeamActions } from './teamActionsContext';

interface TeamActionsProviderProps extends TeamActions {
  children: ReactNode;
}

export function TeamActionsProvider({ selectTeam, switchUser, children }: TeamActionsProviderProps) {
  const inherited = useTeamActions();
  const actions = useMemo(
    () => ({ selectTeam: selectTeam ?? inherited.selectTeam, switchUser: switchUser ?? inherited.switchUser }),
    [inherited, selectTeam, switchUser]
  );
  return <TeamActionsContext.Provider value={actions}>{children}</TeamActionsContext.Provider>;
}

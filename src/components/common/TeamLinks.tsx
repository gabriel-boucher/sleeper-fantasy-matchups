import { createContext, MouseEvent, ReactNode, useContext, useMemo } from 'react';
import { User, UserId } from '../../data/data';
import { getTeamName } from '../../data/matchupAnalysis';
import './TeamLinks.css';

// What clicking a team name or a username does, provided from wherever that action lives:
// the season view selects teams, the app switches the searched Sleeper user
interface TeamActions {
  selectTeam?: (userId: UserId) => void;
  switchUser?: (userId: UserId) => void;
}

const TeamActionsContext = createContext<TeamActions>({});

// Adds actions for everything inside; actions it doesn't set come from further up
export function TeamActionsProvider({ selectTeam, switchUser, children }: TeamActions & { children: ReactNode }) {
  const parent = useContext(TeamActionsContext);
  const value = useMemo(
    () => ({ selectTeam: selectTeam ?? parent.selectTeam, switchUser: switchUser ?? parent.switchUser }),
    [parent, selectTeam, switchUser]
  );
  return <TeamActionsContext.Provider value={value}>{children}</TeamActionsContext.Provider>;
}

// The team's name; clicking it shows that team's season
export function TeamNameLink({ user, className = '' }: { user: User; className?: string }) {
  const { selectTeam } = useContext(TeamActionsContext);
  const name = getTeamName(user);
  if (!selectTeam) return <span className={className}>{name}</span>;

  return (
    <button
      type="button"
      className={`team-link ${className}`}
      title={`Show ${name}'s season`}
      onClick={(e: MouseEvent) => {
        // Inside clickable rows and cards, this click is the team's, not the row's
        e.stopPropagation();
        selectTeam(user.user_id);
      }}
    >
      {name}
    </button>
  );
}

// The manager's Sleeper name; clicking it looks up their leagues instead, staying on this league and season
export function UsernameLink({ user, className = '' }: { user: User; className?: string }) {
  const { switchUser } = useContext(TeamActionsContext);
  const label = `@${user.display_name}`;
  if (!switchUser) return <span className={`username ${className}`}>{label}</span>;

  return (
    <button
      type="button"
      className={`team-link username ${className}`}
      title={`Look up ${user.display_name}'s leagues`}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        switchUser(user.user_id);
      }}
    >
      {label}
    </button>
  );
}

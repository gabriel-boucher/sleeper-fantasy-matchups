import { MouseEvent, ReactNode } from 'react';
import { useTeamActions } from '../../context/teamActionsContext';
import { getTeamName } from '../../domain/teams';
import { User } from '../../types/models';
import './TeamLinks.css';

interface TeamLinkProps {
  user: User;
  className?: string;
}

interface LinkButtonProps {
  className: string;
  title: string;
  onClick: () => void;
  children: ReactNode;
}

function LinkButton({ className, title, onClick, children }: LinkButtonProps) {
  function handleClickWithoutTriggeringParent(e: MouseEvent) {
    e.stopPropagation();
    onClick();
  }

  return (
    <button type="button" className={`team-link ${className}`} title={title} onClick={handleClickWithoutTriggeringParent}>
      {children}
    </button>
  );
}

export function TeamNameLink({ user, className = '' }: TeamLinkProps) {
  const { selectTeam } = useTeamActions();
  const name = getTeamName(user);
  if (!selectTeam) return <span className={className}>{name}</span>;

  return (
    <LinkButton className={className} title={`Show ${name}'s season`} onClick={() => selectTeam(user.id)}>
      {name}
    </LinkButton>
  );
}

export function UsernameLink({ user, className = '' }: TeamLinkProps) {
  const { switchUser } = useTeamActions();
  const usernameClassName = `username ${className}`;
  const { managerId } = user;
  if (managerId === null) return <span className={usernameClassName}>No manager</span>;

  const username = `@${user.displayName}`;
  if (!switchUser) return <span className={usernameClassName}>{username}</span>;

  return (
    <LinkButton className={usernameClassName} title={`Look up ${user.displayName}'s leagues`} onClick={() => switchUser(managerId)}>
      {username}
    </LinkButton>
  );
}

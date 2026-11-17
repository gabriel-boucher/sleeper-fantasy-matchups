import { getTeamName } from '../../domain/teams';
import { Team } from '../../types/models';
import { formatPoints } from '../../utils/format';
import { TeamNameLink, UsernameLink } from '../common/TeamLinks';
import { TickingPoints } from '../common/TickingPoints';
import { UserAvatar } from '../common/UserAvatar';
import { Side } from './side';

interface TeamScoreProps {
  team: Team;
  side: Side;
  isAhead: boolean;
}

export function TeamScore({ team, side, isAhead }: TeamScoreProps) {
  return (
    <div className={`h2h-team ${side} ${isAhead ? 'ahead' : ''}`}>
      <span className="h2h-team-who">
        <UserAvatar url={team.user.avatarUrl} name={getTeamName(team.user)} />
        <span className="h2h-team-identity">
          <TeamNameLink user={team.user} className="h2h-team-name" />
          <UsernameLink user={team.user} className="h2h-team-username" />
        </span>
      </span>
      <span className="h2h-team-score">
        <TickingPoints className="h2h-team-points" points={team.points} />
        {team.projectedPoints !== null && (
          <span className="h2h-team-projected" title="Projected points">{formatPoints(team.projectedPoints)}</span>
        )}
      </span>
    </div>
  );
}

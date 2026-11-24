import { PlayoffTeam } from '../../domain/playoffs';
import { TeamIdentity } from '../common/TeamIdentity';

interface PlayoffTeamLineProps {
  team: PlayoffTeam;
  showsSeedChange: boolean;
}

interface SeedChangeProps {
  seed: number;
  realSeed: number | null;
}

export function PlayoffTeamLine({ team, showsSeedChange }: PlayoffTeamLineProps) {
  return (
    <span className="playoff-team">
      <span className="playoff-seed">{team.seed}</span>
      <TeamIdentity user={team.user} nameClassName="playoff-team-name" />
      {showsSeedChange && <SeedChange seed={team.seed} realSeed={team.realSeed} />}
    </span>
  );
}

function SeedChange({ seed, realSeed }: SeedChangeProps) {
  if (realSeed === null) {
    return <span className="playoff-seed-change up" title="Not in this bracket in real life">New</span>;
  }
  if (realSeed === seed) return null;

  const isHigher = seed < realSeed;
  return (
    <span className={`playoff-seed-change ${isHigher ? 'up' : 'down'}`} title={`Real seed: ${realSeed}`}>
      <span aria-hidden="true">{isHigher ? '▲' : '▼'}</span>
      {Math.abs(realSeed - seed)}
    </span>
  );
}

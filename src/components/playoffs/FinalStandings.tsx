import { FinalPlace } from '../../domain/playoffs';
import { formatOrdinal } from '../../utils/format';
import { TeamIdentity } from '../common/TeamIdentity';
import { BracketDisplay, getSelectedClass } from './bracketDisplay';
import { TeamToBeDecided } from './TeamToBeDecided';

interface FinalStandingsProps {
  places: FinalPlace[];
  display: BracketDisplay;
}

export function FinalStandings({ places, display }: FinalStandingsProps) {
  return (
    <ol className="playoff-standings" aria-label="Final standings">
      {places.map(({ place, team }) => (
        <li key={place} className={`playoff-standing ${getSelectedClass(team, display)}`}>
          <span className="playoff-standing-place">{formatOrdinal(place)}</span>
          {team ? <TeamIdentity user={team.user} nameClassName="playoff-team-name" /> : <TeamToBeDecided />}
        </li>
      ))}
    </ol>
  );
}

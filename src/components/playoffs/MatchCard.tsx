import { PlayoffMatch, PlayoffTeam } from '../../domain/playoffs';
import { formatPoints, MISSING_VALUE } from '../../utils/format';
import { BracketDisplay, getSelectedClass } from './bracketDisplay';
import { getPlaceLabel } from './playoffLabels';
import { PlayoffTeamLine } from './PlayoffTeamLine';
import { TeamToBeDecided } from './TeamToBeDecided';

type MatchRowResult = 'won' | 'lost' | '';

interface MatchCardProps {
  match: PlayoffMatch;
  display: BracketDisplay;
}

interface MatchRowProps {
  team: PlayoffTeam | null;
  result: MatchRowResult;
  display: BracketDisplay;
}

function getHigherScorerIndex({ winnerIndex }: PlayoffMatch, { isToiletBowl }: BracketDisplay): number | null {
  if (winnerIndex === null) return null;
  return isToiletBowl ? 1 - winnerIndex : winnerIndex;
}

export function MatchCard({ match, display }: MatchCardProps) {
  const placeLabel = getPlaceLabel(match.place, display.isToiletBowl, display.teamCount);
  const higherScorerIndex = getHigherScorerIndex(match, display);
  const getResult = (index: number): MatchRowResult => {
    if (higherScorerIndex === null) return '';
    return higherScorerIndex === index ? 'won' : 'lost';
  };

  return (
    <div className="playoff-match-wrap">
      {placeLabel && <span className="playoff-place">{placeLabel}</span>}
      {match.isLive && <span className="live-chip playoff-live">Live</span>}
      <div className="playoff-match">
        {match.teams.map((team, index) => (
          <MatchRow key={index} team={team} result={getResult(index)} display={display} />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ team, result, display }: MatchRowProps) {
  return (
    <div className={`playoff-row ${result} ${getSelectedClass(team, display)}`}>
      {team ? <PlayoffTeamLine team={team} showsSeedChange={display.showsSeedChanges} /> : <TeamToBeDecided />}
      <span className="playoff-points">{team?.points != null ? formatPoints(team.points) : MISSING_VALUE}</span>
    </div>
  );
}

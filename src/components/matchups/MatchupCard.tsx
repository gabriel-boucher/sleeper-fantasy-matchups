import { Matchup, Team } from "../../data/data";
import { getResult, getTeamName, MatchupResult } from "../../data/matchupAnalysis";
import "./MatchupCard.css";

const RESULT_LABELS: Record<MatchupResult, string> = {
  win: 'W',
  loss: 'L',
  tie: 'T',
  unplayed: '–'
};

interface MatchupCardProps {
  matchup: Matchup;
  // The week is still being played: show the score so far, not a result
  isLive?: boolean;
  onSelect: (matchup: Matchup) => void;
}

export function MatchupCard({ matchup, isLive = false, onSelect }: MatchupCardProps) {
  // In a live week, "win"/"loss" just means who's ahead right now
  const result = getResult(matchup);
  const hasStarted = result !== 'unplayed';

  return (
    <button
      type="button"
      className={`matchup-card ${isLive ? 'live' : result}`}
      onClick={() => onSelect(matchup)}
      title="Show lineup"
    >
      <span className="matchup-week">
        <span className="matchup-week-label">Week</span>
        <span className="matchup-week-number">{matchup.week}</span>
      </span>
      <span className="matchup-teams">
        <TeamRow team={matchup.team} isWinner={result === 'win'} />
        <TeamRow team={matchup.opponent} isWinner={result === 'loss'} />
      </span>
      {isLive ? (
        <span className={`live-badge ${hasStarted ? 'started' : ''}`}>{hasStarted ? 'Live' : 'Upcoming'}</span>
      ) : (
        <span className="result-badge" aria-label={result}>{RESULT_LABELS[result]}</span>
      )}
    </button>
  );
}

function TeamRow({ team, isWinner }: { team: Team; isWinner: boolean }) {
  return (
    <span className={`matchup-team ${isWinner ? 'winner' : ''}`}>
      <span className="team-name">{getTeamName(team.user)}</span>
      <span className="team-points">{team.points.toFixed(2)}</span>
    </span>
  );
}

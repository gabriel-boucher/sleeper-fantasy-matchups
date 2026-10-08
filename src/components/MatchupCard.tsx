import { Matchup, Team } from "../data/data";
import { getResult, getTeamName, MatchupResult } from "../data/matchupAnalysis";
import "./MatchupCard.css";

const RESULT_LABELS: Record<MatchupResult, string> = {
  win: 'W',
  loss: 'L',
  tie: 'T',
  unplayed: '–'
};

interface MatchupCardProps {
  matchup: Matchup;
}

export function MatchupCard({ matchup }: MatchupCardProps) {
  const result = getResult(matchup);

  return (
    <article className={`matchup-card ${result}`}>
      <div className="matchup-week">
        <span className="matchup-week-label">Week</span>
        <span className="matchup-week-number">{matchup.week}</span>
      </div>
      <div className="matchup-teams">
        <TeamRow team={matchup.team} isWinner={result === 'win'} />
        <TeamRow team={matchup.opponent} isWinner={result === 'loss'} />
      </div>
      <span className="result-badge" aria-label={result}>{RESULT_LABELS[result]}</span>
    </article>
  );
}

function TeamRow({ team, isWinner }: { team: Team; isWinner: boolean }) {
  return (
    <div className={`matchup-team ${isWinner ? 'winner' : ''}`}>
      <span className="team-name">{getTeamName(team.user)}</span>
      <span className="team-points">{team.points.toFixed(2)}</span>
    </div>
  );
}

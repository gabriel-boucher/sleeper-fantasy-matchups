import { Team } from "../data/data";
import "./MatchupCard.css";

interface MatchupCardProps {
  team1: Team;
  team2: Team;
  week: number;
}

export function MatchupCard({ team1, team2, week }: MatchupCardProps) {
  if (team1.points === 0 && team2.points === 0) {
    return <></>;
  }
  return (
    <div className="matchup-card">
      <h3 className="matchup-header">Week {week} Matchup</h3>
      <div className="matchup-content">
        <div className={`team-container ${team1.points > team2.points ? 'winner' : ''}`}>
          <div className="team-name">{team1.user.team_name || team1.user.display_name}</div>
          <div className="team-points">{team1.points.toFixed(2)}</div>
        </div>
        <div className="vs-divider">vs</div>
        <div className={`team-container ${team2.points > team1.points ? 'winner' : ''}`}>
          <div className="team-name">{team2.user.team_name || team2.user.display_name}</div>
          <div className="team-points">{team2.points.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
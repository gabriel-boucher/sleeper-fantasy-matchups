import { Matchup, Team } from "../../data/data";
import { getResult, getTeamName, MatchupResult } from "../../data/matchupAnalysis";
import { TeamNameLink } from "../common/TeamLinks";
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

// Clicking the card opens the lineups; clicking a team name shows that team's season instead
export function MatchupCard({ matchup, isLive = false, onSelect }: MatchupCardProps) {
  // In a live week, "win"/"loss" just means who's ahead right now
  const result = getResult(matchup);
  const hasStarted = result !== 'unplayed';

  return (
    <div className={`matchup-card ${isLive ? 'live' : result}`}>
      {/* Covers the whole card (see CSS), so the card itself stays clickable around the team names */}
      <button
        type="button"
        className="matchup-card-open"
        onClick={() => onSelect(matchup)}
        title="Show lineup"
        aria-label={`Show week ${matchup.week} lineups: ${getTeamName(matchup.team.user)} vs ${getTeamName(matchup.opponent.user)}`}
      />
      <span className="matchup-week">
        <span className="matchup-week-label">Week</span>
        <span className="matchup-week-number">{matchup.week}</span>
      </span>
      <span className="matchup-teams">
        <TeamRow team={matchup.team} isWinner={result === 'win'} />
        <TeamRow team={matchup.opponent} isWinner={result === 'loss'} />
      </span>
      {isLive ? (
        // Same round one-character badge as a finished week: a pulsing dot once games have started
        <span
          className={`result-badge ${hasStarted ? 'started' : ''}`}
          aria-label={hasStarted ? 'Live' : 'Upcoming'}
          title={hasStarted ? 'Live' : 'Upcoming'}
        >
          {hasStarted ? '●' : '–'}
        </span>
      ) : (
        <span className="result-badge" aria-label={result}>{RESULT_LABELS[result]}</span>
      )}
    </div>
  );
}

function TeamRow({ team, isWinner }: { team: Team; isWinner: boolean }) {
  return (
    <span className={`matchup-team ${isWinner ? 'winner' : ''}`}>
      <TeamNameLink user={team.user} className="team-name" />
      {team.projectedPoints !== null && (
        <span className="team-projected" title="Projected points">
          {team.projectedPoints.toFixed(2)}
        </span>
      )}
      <span className="team-points">{team.points.toFixed(2)}</span>
    </span>
  );
}

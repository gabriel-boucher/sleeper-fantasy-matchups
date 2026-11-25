import { getResult, MatchupResult } from '../../domain/matchups';
import { GameResult, getGameResult } from '../../domain/records';
import { getTeamName } from '../../domain/teams';
import { Matchup, Team } from '../../types/models';
import { formatPoints } from '../../utils/format';
import { TickingPoints } from '../common/TickingPoints';
import { RESULT_LABELS } from './resultLabels';
import './MatchupCard.css';

const MEDIAN_OUTCOMES: Record<GameResult, string> = {
  win: 'won',
  loss: 'lost',
  tie: 'tied'
};

interface MatchupCardProps {
  matchup: Matchup;
  isLive?: boolean;
  median?: number;
  onSelect: (matchup: Matchup) => void;
}

export function MatchupCard({ matchup, isLive = false, median, onSelect }: MatchupCardProps) {
  const { week, team, opponent } = matchup;
  const result = getResult(matchup);
  const hasStarted = result !== 'unplayed';

  return (
    <div className={`matchup-card ${isLive ? 'live' : result}`}>
      <button
        type="button"
        className="matchup-card-open"
        onClick={() => onSelect(matchup)}
        title="Show lineup"
        aria-label={`Show week ${week} lineups: ${getTeamName(team.user)} vs ${getTeamName(opponent.user)}`}
      />
      <span className="matchup-week">
        <span className="matchup-week-label">Week</span>
        <span className="matchup-week-number">{week}</span>
      </span>
      <span className="matchup-teams">
        <TeamRow team={team} isAhead={result === 'win'} />
        <TeamRow team={opponent} isAhead={result === 'loss'} />
      </span>
      <span className="matchup-result">
        {isLive ? <LiveBadge hasStarted={hasStarted} /> : <ResultBadge result={result} />}
        {median !== undefined && hasStarted && <MedianValue median={median} points={team.points} />}
      </span>
    </div>
  );
}

function ResultBadge({ result }: { result: MatchupResult }) {
  return <span className="result-badge" aria-label={result}>{RESULT_LABELS[result]}</span>;
}

function LiveBadge({ hasStarted }: { hasStarted: boolean }) {
  const status = hasStarted ? 'Live' : 'Upcoming';
  return (
    <span className={hasStarted ? 'live-chip' : 'result-badge'} aria-label={status} title={status}>
      {hasStarted ? 'Live' : RESULT_LABELS.unplayed}
    </span>
  );
}

function MedianValue({ median, points }: { median: number; points: number }) {
  const result = getGameResult(points, median);
  const outcome = MEDIAN_OUTCOMES[result];
  return (
    <span className={`matchup-median ${result}`} title={`League median this week (${outcome} against it)`}>
      <span className="visually-hidden">Median </span>
      {formatPoints(median)}
      <span className="visually-hidden"> ({outcome})</span>
    </span>
  );
}

function TeamRow({ team, isAhead }: { team: Team; isAhead: boolean }) {
  return (
    <span className={`matchup-team ${isAhead ? 'winner' : ''}`}>
      <span className="team-name">{getTeamName(team.user)}</span>
      <TickingPoints className="team-points" points={team.points} />
    </span>
  );
}

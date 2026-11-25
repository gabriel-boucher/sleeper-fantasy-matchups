import { PlayoffBye, PlayoffRound } from '../../domain/playoffs';
import { formatWeekSpan } from '../../utils/format';
import { BracketDisplay, getSelectedClass } from './bracketDisplay';
import { getBracketCell, getCellBelowBracket, getHeaderCell } from './bracketGrid';
import { MatchCard } from './MatchCard';
import { PlayoffTeamLine } from './PlayoffTeamLine';

interface RoundColumnProps {
  round: PlayoffRound;
  name: string;
  column: number;
  byes: PlayoffBye[];
  rowCount: number;
  display: BracketDisplay;
}

interface ByeCellProps {
  bye: PlayoffBye;
  column: number;
  display: BracketDisplay;
}

export function RoundColumn({ round, name, column, byes, rowCount, display }: RoundColumnProps) {
  const bracketMatches = round.matches.filter(match => match.rows !== null);
  const placementMatches = round.matches.filter(match => match.rows === null);

  return (
    <>
      <h3 className="playoff-round-title" style={getHeaderCell(column)}>
        {name} <span className="playoff-round-weeks">{formatWeekSpan(round.weeks)}</span>
      </h3>
      {byes.map(bye => <ByeCell key={bye.team.user.id} bye={bye} column={column} display={display} />)}
      {bracketMatches.map(match => (
        <div key={match.id} className="playoff-cell" style={getBracketCell(column, match.rows!)}>
          <MatchCard match={match} display={display} />
        </div>
      ))}
      {placementMatches.length > 0 && (
        <div className="playoff-cell playoff-placements" style={getCellBelowBracket(column, rowCount)}>
          {placementMatches.map(match => <MatchCard key={match.id} match={match} display={display} />)}
        </div>
      )}
    </>
  );
}

function ByeCell({ bye: { team, row }, column, display }: ByeCellProps) {
  return (
    <div
      className={`playoff-cell playoff-bye ${getSelectedClass(team, display)}`}
      style={getBracketCell(column, { start: row, end: row + 1 })}
    >
      <PlayoffTeamLine team={team} showsSeedChange={display.showsSeedChanges} />
      <span className="playoff-bye-label">Bye</span>
    </div>
  );
}

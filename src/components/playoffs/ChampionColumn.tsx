import { FinalPlace, PlayoffTeam } from '../../domain/playoffs';
import { TeamIdentity } from '../common/TeamIdentity';
import { getBracketCell, getHeaderCell } from './bracketGrid';
import { BracketDisplay } from './bracketDisplay';
import { FinalStandings } from './FinalStandings';
import { TO_BE_DECIDED } from './playoffLabels';

interface ChampionColumnProps {
  champion: PlayoffTeam | null;
  finalStandings: FinalPlace[];
  column: number;
  rowCount: number;
  display: BracketDisplay;
}

export function ChampionColumn({ champion, finalStandings, column, rowCount, display }: ChampionColumnProps) {
  const { isToiletBowl } = display;
  const hasDecidedPlaces = finalStandings.some(place => place.team);

  return (
    <>
      <h3 className="playoff-round-title" style={getHeaderCell(column)}>
        {isToiletBowl ? 'Last place' : 'Champion'}
      </h3>
      <div className="playoff-cell playoff-end" style={getBracketCell(column, { start: 0, end: rowCount + 1 })}>
        <div className={`playoff-champion ${isToiletBowl ? 'last-place' : ''} ${champion ? '' : 'pending'}`}>
          <span className="playoff-trophy" aria-hidden="true">{isToiletBowl ? '🚽' : '🏆'}</span>
          {champion ? (
            <>
              <TeamIdentity user={champion.user} nameClassName="playoff-champion-name" />
              <span className="playoff-champion-seed">Seed {champion.seed}</span>
            </>
          ) : (
            <span className="playoff-champion-seed">{TO_BE_DECIDED}</span>
          )}
        </div>
        {hasDecidedPlaces && <FinalStandings places={finalStandings} display={display} />}
      </div>
    </>
  );
}

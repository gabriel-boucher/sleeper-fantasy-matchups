import { PlayoffBracket } from '../../domain/playoffs';
import { BracketDisplay } from './bracketDisplay';
import { getBracketColumns } from './bracketGrid';
import { ChampionColumn } from './ChampionColumn';
import { getRoundName } from './playoffLabels';
import { RoundColumn } from './RoundColumn';
import './PlayoffBracket.css';

interface PlayoffBracketGridProps {
  bracket: PlayoffBracket;
  display: BracketDisplay;
}

export function PlayoffBracketGrid({ bracket, display }: PlayoffBracketGridProps) {
  const { isToiletBowl } = display;
  const lastRound = Math.max(...bracket.rounds.map(round => round.round));
  const columns = getBracketColumns(bracket.rounds.length, isToiletBowl);

  return (
    <div className="playoff-scroll">
      <div className="playoff-grid" style={{ gridTemplateColumns: columns.template }}>
        {bracket.rounds.map((round, index) => (
          <RoundColumn
            key={round.round}
            round={round}
            name={getRoundName(round.round, lastRound, isToiletBowl)}
            column={columns.getRoundColumn(index)}
            byes={bracket.byes.filter(bye => bye.round === round.round)}
            rowCount={bracket.rowCount}
            display={display}
          />
        ))}
        <ChampionColumn
          champion={bracket.champion}
          finalStandings={bracket.finalStandings}
          column={columns.endColumn}
          rowCount={bracket.rowCount}
          display={display}
        />
      </div>
    </div>
  );
}

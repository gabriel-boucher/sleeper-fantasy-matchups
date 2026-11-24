import { useState } from 'react';
import { BracketKind, PlayoffSeeding } from '../../domain/playoffs';
import { usePlayoffBracket } from '../../hooks/usePlayoffBracket';
import { Matchup, Season, UserId } from '../../types/models';
import { Section } from '../common/Section';
import { Segment, SegmentedControl } from '../common/SegmentedControl';
import { getBracketColumns } from './bracketGrid';
import { BracketDisplay } from './bracketDisplay';
import { BracketNavigator } from './BracketNavigator';
import { ChampionColumn } from './ChampionColumn';
import { BRACKET_LABELS, getProjectionHint, getRoundName } from './playoffLabels';
import { RoundColumn } from './RoundColumn';
import './PlayoffBracket.css';

const SEEDINGS: Segment<PlayoffSeeding>[] = [
  { value: 'real', label: 'Real bracket' },
  { value: 'allPlay', label: 'All-play seeds' }
];

interface PlayoffBracketProps {
  season: Season;
  liveMatchups: Matchup[];
  selectedUserId: UserId;
}

export function PlayoffBracket({ season, liveMatchups, selectedUserId }: PlayoffBracketProps) {
  const [seeding, setSeeding] = useState<PlayoffSeeding>('real');
  const [requestedKind, setRequestedKind] = useState<BracketKind>('winners');
  const { bracket, kind, hasToiletBowl, isProjected } = usePlayoffBracket({ season, liveMatchups, seeding, requestedKind });

  if (!bracket) return null;

  const isToiletBowl = kind === 'toiletBowl';
  const lastRound = Math.max(...bracket.rounds.map(round => round.round));
  const columns = getBracketColumns(bracket.rounds.length, isToiletBowl);
  const display: BracketDisplay = {
    isToiletBowl,
    showsSeedChanges: seeding === 'allPlay',
    selectedUserId,
    teamCount: season.rosterOwners.size
  };

  return (
    <Section
      title={isProjected ? `${BRACKET_LABELS.winners} — Projected` : BRACKET_LABELS.winners}
      titleHint={isProjected ? getProjectionHint(season.lastRegularSeasonWeek, season.liveWeek) : undefined}
      actions={<SegmentedControl label="Playoff seeding" segments={SEEDINGS} value={seeding} onChange={setSeeding} />}
    >
      {hasToiletBowl && <BracketNavigator kind={kind} onChange={setRequestedKind} />}

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
    </Section>
  );
}

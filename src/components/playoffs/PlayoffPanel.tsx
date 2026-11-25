import { useState } from 'react';
import { useTeamSelectionContext } from '../../context/teamSelectionContext';
import { BracketKind, PlayoffSeeding } from '../../domain/playoffs';
import { usePlayoffs } from '../../hooks/usePlayoffs';
import { Matchup, Season } from '../../types/models';
import { Panel } from '../common/Panel';
import { Segment, SegmentedControl } from '../common/SegmentedControl';
import { BracketDisplay } from './bracketDisplay';
import { BracketNavigator } from './BracketNavigator';
import { PlayoffBracketGrid } from './PlayoffBracketGrid';
import { getPlayoffPanelHint, getPlayoffPanelTitle } from './playoffLabels';
import { PlayoffOddsTable } from './PlayoffOddsTable';
import './PlayoffPanel.css';

const SEEDINGS: Segment<PlayoffSeeding>[] = [
  { value: 'real', label: 'Real bracket' },
  { value: 'allPlay', label: 'All-play seeds' }
];

interface PlayoffPanelProps {
  season: Season;
  liveMatchups: Matchup[];
}

export function PlayoffPanel({ season, liveMatchups }: PlayoffPanelProps) {
  const { selectedUserId } = useTeamSelectionContext();
  const [seeding, setSeeding] = useState<PlayoffSeeding>('real');
  const [requestedKind, setRequestedKind] = useState<BracketKind>('winners');
  const { bracket, kind, hasToiletBowl, mode, odds, confirmedOutcomes } = usePlayoffs({ season, liveMatchups, seeding, requestedKind });

  if (!bracket) return null;

  const display: BracketDisplay = {
    isToiletBowl: kind === 'toiletBowl',
    showsSeedChanges: seeding === 'allPlay',
    selectedUserId,
    teamCount: season.rosterOwners.size
  };

  return (
    <Panel
      title={getPlayoffPanelTitle(mode)}
      titleHint={getPlayoffPanelHint(mode, season)}
      className="playoff-panel"
      actions={<SegmentedControl label="Playoff seeding" segments={SEEDINGS} value={seeding} onChange={setSeeding} />}
    >
      <div className="playoff-panel-body">
        {hasToiletBowl && <BracketNavigator kind={kind} onChange={setRequestedKind} />}
        <PlayoffBracketGrid bracket={bracket} display={display} />
        {odds && odds.length > 0 && <PlayoffOddsTable odds={odds} confirmedOutcomes={confirmedOutcomes} />}
      </div>
    </Panel>
  );
}

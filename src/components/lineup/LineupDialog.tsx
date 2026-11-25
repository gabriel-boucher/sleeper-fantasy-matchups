import { KeyboardEvent } from 'react';
import { BENCH_SLOT, LineupPlayer } from '../../domain/lineup';
import { getResult } from '../../domain/matchups';
import { getTeamName } from '../../domain/teams';
import { useWeekLineup } from '../../hooks/useWeekLineup';
import { BestLineupContext, Matchup, PlayerDirectory, PlayerId } from '../../types/models';
import { CloseButton } from '../common/CloseButton';
import { Modal } from '../common/Modal';
import { WeekNavigator } from '../common/WeekNavigator';
import { LineupRow, LineupSection } from './LineupSection';
import { MatchupStats } from './MatchupStats';
import { TeamScore } from './TeamScore';
import './LineupDialog.css';

interface LineupDialogProps {
  matchup: Matchup;
  isLive: boolean;
  median: number | undefined;
  weeks: number[];
  onWeekChange: (week: number) => void;
  slotNames: string[];
  bestLineupContext: BestLineupContext | null;
  players: PlayerDirectory | null;
  injuredStarterIds: ReadonlySet<PlayerId> | null;
  showNflTeams: boolean;
  onClose: () => void;
}

function pairSideBySide(left: LineupPlayer[], right: LineupPlayer[], getSlot: (index: number) => string): LineupRow[] {
  return Array.from({ length: Math.max(left.length, right.length) }, (_, i) => ({
    slot: getSlot(i),
    left: left[i] ?? null,
    right: right[i] ?? null
  }));
}

export function LineupDialog({ matchup, isLive, median, weeks, onWeekChange, slotNames, bestLineupContext, players, injuredStarterIds, showNflTeams, onClose }: LineupDialogProps) {
  const { week, team, opponent } = matchup;
  const result = getResult(matchup);
  const teamLineup = useWeekLineup(team, slotNames, bestLineupContext, players);
  const opponentLineup = useWeekLineup(opponent, slotNames, bestLineupContext, players);

  const teamStarters = teamLineup?.starters ?? [];
  const opponentStarters = opponentLineup?.starters ?? [];
  const starterRows = pairSideBySide(teamStarters, opponentStarters, i => teamStarters[i]?.slot ?? opponentStarters[i]?.slot ?? '');
  const benchRows = pairSideBySide(teamLineup?.bench ?? [], opponentLineup?.bench ?? [], () => BENCH_SLOT);

  function stepWeekWithArrowKeys(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const step = e.key === 'ArrowLeft' ? -1 : 1;
    const nextWeek = weeks[weeks.indexOf(week) + step];
    if (nextWeek === undefined) return;
    e.preventDefault();
    onWeekChange(nextWeek);
  }

  return (
    <Modal className="lineup-dialog" labelledBy="lineup-dialog-title" onClose={onClose} onKeyDown={stepWeekWithArrowKeys}>
      <div className="lineup-dialog-content">
        <header className="lineup-dialog-header">
          <h2 id="lineup-dialog-title" className="visually-hidden">
            Week {week}: {getTeamName(team.user)} vs {getTeamName(opponent.user)}
          </h2>
          <div className="lineup-dialog-week">
            <WeekNavigator weeks={weeks} week={week} onChange={onWeekChange} />
            {isLive && <span className="live-chip">Live</span>}
          </div>
          <CloseButton onClick={onClose} />
        </header>

        <div className="h2h-row h2h-scores">
          <TeamScore team={team} side="left" isAhead={result === 'win'} />
          <span className="h2h-vs" aria-hidden="true">vs</span>
          <TeamScore team={opponent} side="right" isAhead={result === 'loss'} />
        </div>

        <MatchupStats
          team={team}
          opponent={opponent}
          teamLineup={teamLineup}
          opponentLineup={opponentLineup}
          median={result === 'unplayed' ? undefined : median}
        />

        {starterRows.length > 0 && (
          <LineupSection title="Starters" rows={starterRows} showNflTeams={showNflTeams} injuredPlayerIds={injuredStarterIds} />
        )}
        {benchRows.length > 0 && <LineupSection title="Bench" rows={benchRows} showNflTeams={showNflTeams} />}
      </div>
    </Modal>
  );
}

import { KeyboardEvent, MouseEvent, SyntheticEvent, useEffect, useRef } from 'react';
import { BENCH_SLOT, LineupPlayer } from '../../domain/lineup';
import { getResult } from '../../domain/matchups';
import { getTeamName } from '../../domain/teams';
import { useWeekLineup } from '../../hooks/useWeekLineup';
import { BestLineupContext, Matchup, PlayerDirectory } from '../../types/models';
import { WeekNavigator } from '../common/WeekNavigator';
import { LineupRow, LineupSection } from './LineupSection';
import { LineupSummary } from './LineupSummary';
import { TeamScore } from './TeamScore';
import './LineupDialog.css';

interface LineupDialogProps {
  matchup: Matchup;
  isLive: boolean;
  weeks: number[];
  onWeekChange: (week: number) => void;
  slotNames: string[];
  bestLineupContext: BestLineupContext | null;
  players: PlayerDirectory | null;
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

export function LineupDialog({ matchup, isLive, weeks, onWeekChange, slotNames, bestLineupContext, players, showNflTeams, onClose }: LineupDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { week, team, opponent } = matchup;
  const result = getResult(matchup);
  const teamLineup = useWeekLineup(team, slotNames, bestLineupContext, players);
  const opponentLineup = useWeekLineup(opponent, slotNames, bestLineupContext, players);

  const teamStarters = teamLineup?.starters ?? [];
  const opponentStarters = opponentLineup?.starters ?? [];
  const starterRows = pairSideBySide(teamStarters, opponentStarters, i => teamStarters[i]?.slot ?? opponentStarters[i]?.slot ?? '');
  const benchRows = pairSideBySide(teamLineup?.bench ?? [], opponentLineup?.bench ?? [], () => BENCH_SLOT);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function closeOnBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    const isBackdropClick = e.target === e.currentTarget;
    if (isBackdropClick) onClose();
  }

  function closeOnEscape(e: SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    onClose();
  }

  function stepWeekWithArrowKeys(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const step = e.key === 'ArrowLeft' ? -1 : 1;
    const nextWeek = weeks[weeks.indexOf(week) + step];
    if (nextWeek === undefined) return;
    e.preventDefault();
    onWeekChange(nextWeek);
  }

  return (
    <dialog
      ref={dialogRef}
      className="lineup-dialog"
      onClick={closeOnBackdropClick}
      onCancel={closeOnEscape}
      onClose={onClose}
      onKeyDown={stepWeekWithArrowKeys}
      aria-labelledby="lineup-dialog-title"
    >
      <div className="lineup-dialog-content">
        <header className="lineup-dialog-header">
          <h2 id="lineup-dialog-title" className="visually-hidden">
            Week {week}: {getTeamName(team.user)} vs {getTeamName(opponent.user)}
          </h2>
          <div className="lineup-dialog-week">
            <WeekNavigator weeks={weeks} week={week} onChange={onWeekChange} />
            {isLive && <span className="lineup-dialog-live">Live</span>}
          </div>
          <button type="button" className="lineup-dialog-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className="h2h-row h2h-scores">
          <TeamScore team={team} side="left" isAhead={result === 'win'} />
          <span className="h2h-vs" aria-hidden="true">vs</span>
          <TeamScore team={opponent} side="right" isAhead={result === 'loss'} />
        </div>

        {starterRows.length > 0 && <LineupSection title="Starters" rows={starterRows} showNflTeams={showNflTeams} />}
        {benchRows.length > 0 && <LineupSection title="Bench" rows={benchRows} showNflTeams={showNflTeams} />}

        <div className="h2h-row h2h-summaries">
          <LineupSummary team={team} lineup={teamLineup} side="left" />
          <span />
          <LineupSummary team={opponent} lineup={opponentLineup} side="right" />
        </div>
      </div>
    </dialog>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

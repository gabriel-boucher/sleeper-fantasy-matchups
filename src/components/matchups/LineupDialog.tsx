import { KeyboardEvent, MouseEvent, SyntheticEvent, useEffect, useMemo, useRef } from 'react';
import { Matchup, Team } from '../../data/data';
import { getWeekLineup, LineupPlayer, PlayerDirectory, WeekLineup } from '../../data/lineup';
import { getResult, getTeamName } from '../../data/matchupAnalysis';
import { TeamNameLink, UsernameLink } from '../common/TeamLinks';
import { UserAvatar } from '../common/UserAvatar';
import { WeekNavigator } from '../common/WeekNavigator';
import { PlayerAvatar } from './PlayerAvatar';
import './LineupDialog.css';

interface LineupDialogProps {
  matchup: Matchup;
  isLive: boolean;
  // Weeks the popup can step through, in order
  weeks: number[];
  onWeekChange: (week: number) => void;
  slotNames: string[];
  // Positions each starting slot accepts; null when the best lineup can't be worked out
  slots: string[][] | null;
  players: PlayerDirectory | null;
  // Player teams are only known for today, so past seasons leave them out
  showNflTeams: boolean;
  onClose: () => void;
}

// The team is on the left, the opponent mirrored on the right
type Side = 'left' | 'right';

interface Row {
  slot: string;
  left: LineupPlayer | null;
  right: LineupPlayer | null;
}

// Both lineups of a matchup head to head, slot by slot, opened from a matchup card
export function LineupDialog({ matchup, isLive, weeks, onWeekChange, slotNames, slots, players, showNflTeams, onClose }: LineupDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { team, opponent } = matchup;
  const result = getResult(matchup);
  const left = useWeekLineup(team, slotNames, slots, players);
  const right = useWeekLineup(opponent, slotNames, slots, players);

  const starterRows = pairRows(left?.starters ?? [], right?.starters ?? [], i =>
    left?.starters[i]?.slot ?? right?.starters[i]?.slot ?? '');
  const benchRows = pairRows(left?.bench ?? [], right?.bench ?? [], () => 'BN');

  // Opening as a modal gives Esc to close and keeps keyboard focus inside the dialog
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Closing goes straight through React rather than waiting for the dialog's own close event,
  // which some browsers deliver late or not at all
  function handleClick(e: MouseEvent<HTMLDialogElement>) {
    // A click on the dialog itself (not its content) is a click on the backdrop
    if (e.target === e.currentTarget) onClose();
  }

  function handleCancel(e: SyntheticEvent<HTMLDialogElement>) {
    // Esc: let React close it instead of the browser
    e.preventDefault();
    onClose();
  }

  // ← and → step through the weeks too
  function handleKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const index = weeks.indexOf(matchup.week);
    const week = weeks[index + (e.key === 'ArrowLeft' ? -1 : 1)];
    if (week === undefined) return;
    e.preventDefault();
    onWeekChange(week);
  }

  return (
    <dialog
      ref={dialogRef}
      className="lineup-dialog"
      onClick={handleClick}
      onCancel={handleCancel}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      aria-labelledby="lineup-dialog-title"
    >
      <div className="lineup-dialog-content">
        <header className="lineup-dialog-header">
          {/* The week shows in the navigator; the heading names the matchup for screen readers */}
          <h2 id="lineup-dialog-title" className="visually-hidden">
            Week {matchup.week}: {getTeamName(team.user)} vs {getTeamName(opponent.user)}
          </h2>
          <div className="lineup-dialog-week">
            <WeekNavigator weeks={weeks} week={matchup.week} onChange={onWeekChange} />
            {isLive && <span className="lineup-dialog-live">Live</span>}
          </div>
          <button type="button" className="lineup-dialog-close" onClick={onClose} aria-label="Close">
            {/* Drawn rather than a "×" character, which fonts don't center */}
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
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
          <LineupSummary team={team} lineup={left} side="left" />
          <span />
          <LineupSummary team={opponent} lineup={right} side="right" />
        </div>
      </div>
    </dialog>
  );
}

function useWeekLineup(team: Team, slotNames: string[], slots: string[][] | null, players: PlayerDirectory | null) {
  return useMemo(
    () => (team.roster ? getWeekLineup(team.roster, slotNames, slots, players) : null),
    [team.roster, slotNames, slots, players]
  );
}

// Lines the two lists up row by row; the shorter one gets empty spots
function pairRows(left: LineupPlayer[], right: LineupPlayer[], getSlot: (index: number) => string): Row[] {
  return Array.from({ length: Math.max(left.length, right.length) }, (_, i) => ({
    slot: getSlot(i),
    left: left[i] ?? null,
    right: right[i] ?? null
  }));
}

function TeamScore({ team, side, isAhead }: { team: Team; side: Side; isAhead: boolean }) {
  return (
    <div className={`h2h-team ${side} ${isAhead ? 'ahead' : ''}`}>
      {/* Team picture, then the team name over the manager's Sleeper name (mirrored on the right) */}
      <span className="h2h-team-who">
        <UserAvatar url={team.user.avatarUrl} name={getTeamName(team.user)} />
        <span className="h2h-team-identity">
          <TeamNameLink user={team.user} className="h2h-team-name" />
          <UsernameLink user={team.user} className="h2h-team-username" />
        </span>
      </span>
      {/* Score with its projection right under it, beside the name */}
      <span className="h2h-team-score">
        <span className="h2h-team-points">{team.points.toFixed(2)}</span>
        {team.projectedPoints !== null && (
          <span className="h2h-team-projected" title="Projected points">{team.projectedPoints.toFixed(2)}</span>
        )}
      </span>
    </div>
  );
}

function LineupSection({ title, rows, showNflTeams }: { title: string; rows: Row[]; showNflTeams: boolean }) {
  return (
    <section className="lineup-section">
      <h3 className="section-title lineup-section-title">{title}</h3>
      <div className="h2h-lineup">
        {rows.map((row, i) => (
          <div className="h2h-row h2h-player-row" key={`${row.left?.id}-${row.right?.id}-${i}`}>
            <PlayerCell player={row.left} side="left" showNflTeam={showNflTeams} />
            <SlotBadge slot={row.slot} />
            <PlayerCell player={row.right} side="right" showNflTeam={showNflTeams} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PlayerCell({ player, side, showNflTeam }: { player: LineupPlayer | null; side: Side; showNflTeam: boolean }) {
  // The shorter bench leaves blank spots
  if (!player) return <div className={`h2h-player ${side}`} />;

  const isEmpty = player.id === '0';
  return (
    <div className={`h2h-player ${side}`}>
      <PlayerName player={player} showNflTeam={showNflTeam} />
      <span className="h2h-player-points">
        <span className="h2h-player-actual">{isEmpty ? '–' : player.points.toFixed(2)}</span>
        {player.projected !== null && (
          <span className="h2h-player-projected" title="Projected points">{player.projected.toFixed(2)}</span>
        )}
      </span>
    </div>
  );
}

function PlayerName({ player: lineupPlayer, showNflTeam }: { player: LineupPlayer; showNflTeam: boolean }) {
  const { id, player } = lineupPlayer;
  if (id === '0') {
    return (
      <span className="lineup-player-info">
        {/* Blank circle keeps names lined up */}
        <span className="player-avatar fallback" aria-hidden="true" />
        <span className="lineup-player-empty">Empty</span>
      </span>
    );
  }

  return (
    <span className="lineup-player-info">
      <PlayerAvatar playerId={id} player={player} />
      <span className="lineup-player-text">
        <span className="lineup-player-name">{player?.name ?? `Player ${id}`}</span>
        <span className="lineup-player-meta">
          {player && (
            <span className="lineup-player-meta-text">
              {player.positions.join('/')}{showNflTeam && player.nflTeam ? ` · ${player.nflTeam}` : ''}
            </span>
          )}
          <LineupTag player={lineupPlayer} />
        </span>
      </span>
    </span>
  );
}

// Colored like Sleeper's lineup slots
function SlotBadge({ slot }: { slot: string }) {
  return <span className={`slot-badge slot-${slot}`}>{formatSlot(slot)}</span>;
}

function LineupSummary({ team, lineup, side }: { team: Team; lineup: WeekLineup | null; side: Side }) {
  if (!lineup) return <p className={`lineup-dialog-summary ${side}`}>Sleeper didn't return this lineup.</p>;
  if (team.bestPoints === null) return <span />;

  const pointsLeft = team.bestPoints - team.points;
  return (
    <p className={`lineup-dialog-summary ${side}`}>
      Best lineup: <strong>{team.bestPoints.toFixed(2)}</strong>
      <br />
      {pointsLeft > 0.005 ? <><strong>{pointsLeft.toFixed(2)}</strong> left on the bench</> : 'Perfect lineup'}
    </p>
  );
}

// Flags the moves the best lineup would have made
function LineupTag({ player }: { player: LineupPlayer }) {
  if (player.slot !== null && player.inBestLineup === false) {
    return <span className="lineup-tag-badge sit">Should sit</span>;
  }
  if (player.slot === null && player.inBestLineup === true) {
    return <span className="lineup-tag-badge start">Should start</span>;
  }
  return null;
}

function formatSlot(slot: string): string {
  return { SUPER_FLEX: 'SF', WRRB_FLEX: 'W/R', REC_FLEX: 'W/T', IDP_FLEX: 'IDP' }[slot] ?? slot;
}

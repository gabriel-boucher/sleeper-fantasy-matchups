import { MouseEvent, SyntheticEvent, useEffect, useMemo, useRef } from 'react';
import { Matchup } from '../../data/data';
import { getWeekLineup, LineupPlayer, PlayerDirectory } from '../../data/lineup';
import { getTeamName } from '../../data/matchupAnalysis';
import { PlayerAvatar } from './PlayerAvatar';
import './LineupDialog.css';

interface LineupDialogProps {
  matchup: Matchup;
  isLive: boolean;
  slotNames: string[];
  // Positions each starting slot accepts; null when the best lineup can't be worked out
  slots: string[][] | null;
  players: PlayerDirectory | null;
  // Player teams are only known for today, so past seasons leave them out
  showNflTeams: boolean;
  onClose: () => void;
}

// The team's starters and bench for one week, opened from a matchup card
export function LineupDialog({ matchup, isLive, slotNames, slots, players, showNflTeams, onClose }: LineupDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { team, opponent } = matchup;
  const lineup = useMemo(
    () => (team.roster ? getWeekLineup(team.roster, slotNames, slots, players) : null),
    [team.roster, slotNames, slots, players]
  );

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

  const pointsLeft = team.bestPoints !== null ? team.bestPoints - team.points : null;

  return (
    <dialog
      ref={dialogRef}
      className="lineup-dialog"
      onClick={handleClick}
      onCancel={handleCancel}
      onClose={onClose}
      aria-labelledby="lineup-dialog-title"
    >
      <div className="lineup-dialog-content">
        <header className="lineup-dialog-header">
          <div>
            <h2 id="lineup-dialog-title" className="lineup-dialog-title">
              Week {matchup.week} · {getTeamName(team.user)}
              {isLive && <span className="lineup-dialog-live">Live</span>}
            </h2>
            <p className="lineup-dialog-score">
              <strong>{team.points.toFixed(2)}</strong> vs {opponent.points.toFixed(2)} {getTeamName(opponent.user)}
            </p>
          </div>
          <button type="button" className="lineup-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {lineup ? (
          <>
            <LineupTable title="Starters" players={lineup.starters} showNflTeams={showNflTeams} showSlot />
            {lineup.bench.length > 0 && <LineupTable title="Bench" players={lineup.bench} showNflTeams={showNflTeams} />}
            {pointsLeft !== null && (
              <p className="lineup-dialog-summary">
                Best possible lineup: <strong>{team.bestPoints!.toFixed(2)}</strong>
                {pointsLeft > 0.005
                  ? <> · <strong>{pointsLeft.toFixed(2)}</strong> left on the bench</>
                  : ' · perfect lineup'}
              </p>
            )}
          </>
        ) : (
          <p className="empty-state">Sleeper didn't return this lineup.</p>
        )}
      </div>
    </dialog>
  );
}

function LineupTable({ title, players, showNflTeams, showSlot = false }: {
  title: string;
  players: LineupPlayer[];
  showNflTeams: boolean;
  showSlot?: boolean;
}) {
  return (
    <section className="lineup-section">
      <h3 className="section-title">{title}</h3>
      <table className="lineup-table">
        <tbody>
          {players.map((p, i) => (
            <tr key={`${p.id}-${i}`}>
              {showSlot && <td className="lineup-slot">{formatSlot(p.slot)}</td>}
              <td className="lineup-player">
                <PlayerName player={p} showNflTeam={showNflTeams} />
              </td>
              <td className="lineup-tag"><LineupTag player={p} /></td>
              <td className="lineup-points">{p.id === '0' ? '–' : p.points.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function PlayerName({ player: { id, player }, showNflTeam }: { player: LineupPlayer; showNflTeam: boolean }) {
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
        {player && (
          <span className="lineup-player-meta">
            {player.positions.join('/')}{showNflTeam && player.nflTeam ? ` · ${player.nflTeam}` : ''}
          </span>
        )}
      </span>
    </span>
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

function formatSlot(slot: string | null): string {
  if (!slot) return '';
  return { SUPER_FLEX: 'SF', WRRB_FLEX: 'W/R', REC_FLEX: 'W/T', IDP_FLEX: 'IDP' }[slot] ?? slot;
}

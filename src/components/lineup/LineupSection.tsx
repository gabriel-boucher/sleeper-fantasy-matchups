import { getLineupAdvice, getSlotAbbreviation, isEmptySlot, LineupAdvice, LineupPlayer } from '../../domain/lineup';
import { formatPoints } from '../../utils/format';
import { EmptyPlayerAvatar, PlayerAvatar } from './PlayerAvatar';
import { Side } from './side';

export interface LineupRow {
  slot: string;
  left: LineupPlayer | null;
  right: LineupPlayer | null;
}

interface LineupSectionProps {
  title: string;
  rows: LineupRow[];
  showNflTeams: boolean;
}

interface PlayerCellProps {
  lineupPlayer: LineupPlayer | null;
  side: Side;
  showNflTeam: boolean;
}

interface PlayerIdentityProps {
  lineupPlayer: LineupPlayer;
  showNflTeam: boolean;
}

const ADVICE_LABELS: Record<LineupAdvice, string> = {
  sit: 'Should sit',
  start: 'Should start'
};

const NO_POINTS = '–';

export function LineupSection({ title, rows, showNflTeams }: LineupSectionProps) {
  return (
    <section className="lineup-section">
      <h3 className="section-title lineup-section-title">{title}</h3>
      <div className="h2h-lineup">
        {rows.map((row, i) => (
          <div className="h2h-row h2h-player-row" key={`${row.left?.id}-${row.right?.id}-${i}`}>
            <PlayerCell lineupPlayer={row.left} side="left" showNflTeam={showNflTeams} />
            <SlotBadge slot={row.slot} />
            <PlayerCell lineupPlayer={row.right} side="right" showNflTeam={showNflTeams} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PlayerCell({ lineupPlayer, side, showNflTeam }: PlayerCellProps) {
  if (!lineupPlayer) return <div className={`h2h-player ${side}`} />;

  return (
    <div className={`h2h-player ${side}`}>
      {isEmptySlot(lineupPlayer)
        ? <EmptySlotIdentity />
        : <PlayerIdentity lineupPlayer={lineupPlayer} showNflTeam={showNflTeam} />}
      <span className="h2h-player-points">
        <span className="h2h-player-actual">{isEmptySlot(lineupPlayer) ? NO_POINTS : formatPoints(lineupPlayer.points)}</span>
        {lineupPlayer.projected !== null && (
          <span className="h2h-player-projected" title="Projected points">{formatPoints(lineupPlayer.projected)}</span>
        )}
      </span>
    </div>
  );
}

function EmptySlotIdentity() {
  return (
    <span className="lineup-player-info">
      <EmptyPlayerAvatar />
      <span className="lineup-player-empty">Empty</span>
    </span>
  );
}

function PlayerIdentity({ lineupPlayer, showNflTeam }: PlayerIdentityProps) {
  const { id, player } = lineupPlayer;
  const nflTeam = showNflTeam && player?.nflTeam ? ` · ${player.nflTeam}` : '';

  return (
    <span className="lineup-player-info">
      <PlayerAvatar playerId={id} player={player} />
      <span className="lineup-player-text">
        <span className="lineup-player-name">{player?.name ?? `Player ${id}`}</span>
        <span className="lineup-player-meta">
          {player && <span className="lineup-player-meta-text">{player.positions.join('/')}{nflTeam}</span>}
          <AdviceBadge lineupPlayer={lineupPlayer} />
        </span>
      </span>
    </span>
  );
}

function SlotBadge({ slot }: { slot: string }) {
  return <span className={`slot-badge slot-${slot}`}>{getSlotAbbreviation(slot)}</span>;
}

function AdviceBadge({ lineupPlayer }: { lineupPlayer: LineupPlayer }) {
  const advice = getLineupAdvice(lineupPlayer);
  return advice && <span className={`lineup-tag-badge ${advice}`}>{ADVICE_LABELS[advice]}</span>;
}

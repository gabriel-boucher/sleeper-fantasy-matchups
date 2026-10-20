import { useState } from 'react';
import { PlayerInfo } from '../../data/lineup';
import { getPlayerImageUrl } from '../../utils/playerImages';
import './PlayerAvatar.css';

interface PlayerAvatarProps {
  playerId: string;
  // null when Sleeper's player list doesn't have the player
  player: PlayerInfo | null;
}

// Headshot (or team logo for defenses); falls back to initials when there's no picture
export function PlayerAvatar({ playerId, player }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const isDefense = player?.positions.includes('DEF') ?? false;

  if (!player || failed) {
    return <span className="player-avatar fallback" aria-hidden="true">{getInitials(player?.name ?? '?')}</span>;
  }

  return (
    <img
      className={`player-avatar ${isDefense ? 'logo' : ''}`}
      src={getPlayerImageUrl(playerId, player.positions)}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

import { useState } from 'react';
import { getPlayerImageUrl } from '../../api/sleeper/sleeperCdn';
import { isTeamDefense } from '../../domain/lineup';
import { PlayerId, PlayerInfo } from '../../types/models';
import { getInitials } from '../../utils/format';
import './PlayerAvatar.css';

interface PlayerAvatarProps {
  playerId: PlayerId;
  player: PlayerInfo | null;
}

const UNKNOWN_PLAYER_INITIALS = '?';
const SIZE_PX = 36;

export function PlayerAvatar({ playerId, player }: PlayerAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = player ? getPlayerImageUrl(playerId, player.positions) : null;

  if (!player || !url || failedUrl === url) {
    return (
      <span className="player-avatar fallback" aria-hidden="true">
        {player ? getInitials(player.name) : UNKNOWN_PLAYER_INITIALS}
      </span>
    );
  }

  return (
    <img
      className={`player-avatar ${isTeamDefense(player.positions) ? 'logo' : ''}`}
      src={url}
      alt=""
      width={SIZE_PX}
      height={SIZE_PX}
      loading="lazy"
      decoding="async"
      onError={() => setFailedUrl(url)}
    />
  );
}

export function EmptyPlayerAvatar() {
  return <span className="player-avatar fallback" aria-hidden="true" />;
}

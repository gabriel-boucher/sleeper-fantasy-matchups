import { isTeamDefense } from '../../domain/lineup';
import { PlayerId } from '../../types/models';

const CDN_URL = 'https://sleepercdn.com';

export function getAvatarUrl(avatarId: string | null | undefined): string | null {
  return avatarId ? `${CDN_URL}/avatars/thumbs/${encodeURIComponent(avatarId)}` : null;
}

export function getPlayerImageUrl(playerId: PlayerId, positions: string[]): string {
  return isTeamDefense(positions)
    ? `${CDN_URL}/images/team_logos/nfl/${playerId.toLowerCase()}.png`
    : `${CDN_URL}/content/nfl/players/thumb/${playerId}.jpg`;
}

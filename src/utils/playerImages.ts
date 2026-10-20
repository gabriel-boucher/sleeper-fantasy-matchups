const CDN = 'https://sleepercdn.com';

// Sleeper's headshot for a player, or the team logo for a team defense (whose id is the team, e.g. "KC")
export function getPlayerImageUrl(playerId: string, positions: string[]): string {
  return positions.includes('DEF')
    ? `${CDN}/images/team_logos/nfl/${playerId.toLowerCase()}.png`
    : `${CDN}/content/nfl/players/thumb/${playerId}.jpg`;
}

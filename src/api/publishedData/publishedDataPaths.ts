export const PUBLISHED_PLAYERS_PATH = 'players.json';

export function getPublishedWeekInjuriesPath(season: string, week: number): string {
  return `injuries/${season}/week-${week}.json`;
}

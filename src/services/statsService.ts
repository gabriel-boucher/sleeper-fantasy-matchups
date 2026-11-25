import { getWeeklyStats } from '../api/sleeper/sleeperApi';
import { CURATED_SCORING_KEYS } from '../constants/scoringSettingGroups';
import { getSeasonRescorer, rescoreMatchups } from '../domain/rescoring';
import { Matchup, PlayerId, PlayerStats, Season, WeeklyStats, WeekPlayerStats } from '../types/models';
import { filterEntries } from '../utils/collections';
import { loadWeeks, openWeeklyStore, toStoredWeeks, WeeklyStore, withLiveWeek } from '../utils/weeklyCache';

const STORAGE_PREFIX = 'sleeper-stats-v1:';
const FALLBACK_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

export async function loadSeasonStats(season: Season): Promise<WeeklyStats> {
  const store = openStatsStore(season);
  const completedWeeks = [...season.completedWeeklyRosters.keys()];
  const weeklyStats = await loadWeeks({
    weeks: withLiveWeek(completedWeeks, season.liveWeek),
    liveWeek: season.liveWeek,
    stored: store.stored,
    fetchWeek: week => fetchWeekStats(season, week)
  });

  store.write(toStoredWeeks(weeklyStats, completedWeeks, weekStats => weekStats));
  return weeklyStats;
}

export async function rescoreLiveMatchups(season: Season, liveWeek: number, matchups: Matchup[]): Promise<Matchup[]> {
  const rescorer = getSeasonRescorer(season);
  if (!rescorer) return matchups;
  const weekStats = await fetchWeekStats(season, liveWeek, matchups);
  return rescoreMatchups(matchups, new Map([[liveWeek, weekStats]]), rescorer);
}

function openStatsStore(season: Season): WeeklyStore<WeekPlayerStats> {
  return openWeeklyStore(STORAGE_PREFIX + season.leagueId);
}

async function fetchWeekStats(season: Season, week: number, extraMatchups: Matchup[] = []): Promise<WeekPlayerStats> {
  const positions = season.projectionSettings?.startingPositions ?? FALLBACK_POSITIONS;
  const statDtos = await getWeeklyStats(season.nflSeason, week, positions);
  const rosteredPlayers = getRosteredPlayers(season, week, extraMatchups);
  const scoringKeys = getScoringKeys(season);

  const weekStats: WeekPlayerStats = {};
  statDtos.forEach(({ player_id, stats }) => {
    if (!rosteredPlayers.has(player_id) || !stats) return;
    const kept = pickScoringStats(stats, scoringKeys);
    if (Object.keys(kept).length > 0) weekStats[player_id] = kept;
  });
  return weekStats;
}

function getRosteredPlayers(season: Season, week: number, extraMatchups: Matchup[]): Set<PlayerId> {
  const completedRosters = [...(season.completedWeeklyRosters.get(week)?.values() ?? [])];
  const liveMatchups = week === season.liveWeek ? [...season.liveMatchups, ...extraMatchups] : extraMatchups;
  const liveRosters = liveMatchups.flatMap(m => (m.team.roster ? [m.team.roster] : []));
  return new Set([...completedRosters, ...liveRosters].flatMap(roster => [...roster.players, ...roster.starters]));
}

function getScoringKeys(season: Season): Set<string> {
  return new Set([...CURATED_SCORING_KEYS, ...Object.keys(season.defaultSettings.scoring)]);
}

function pickScoringStats(stats: PlayerStats, scoringKeys: Set<string>): PlayerStats {
  return filterEntries(stats, (key, value) => scoringKeys.has(key) && value !== 0);
}

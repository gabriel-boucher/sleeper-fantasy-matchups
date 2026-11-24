import { INJURY_PARSER_VERSION, toSleeperIdsOutForGame } from '../../src/api/espn/espnMappers';
import { PublishedWeekInjuriesDto } from '../../src/api/publishedData/publishedDataDto';
import { getPublishedWeekInjuriesPath } from '../../src/api/publishedData/publishedDataPaths';
import { NflStateDto } from '../../src/api/sleeper/sleeperDto';
import { FIRST_SLEEPER_SEASON } from '../../src/constants/seasons';
import { DEFAULT_WEEK_COUNT } from '../../src/constants/weeks';
import { loadEspnWeekInjuries } from '../../src/services/espnInjuryService';
import { PlayerDirectory } from '../../src/types/models';
import { wait } from '../../src/utils/async';
import { range } from '../../src/utils/collections';
import { JsonFiles } from './jsonFiles';

const MAX_WEEKS_PER_BATCH = 50;
const PAUSE_BETWEEN_WEEKS_MS = 1000;
const PAUSE_BETWEEN_BATCHES_MS = 2 * 60 * 1000;
const REPROCESSED_RECENT_WEEKS = 2;

interface WeekToPublish {
  season: string;
  week: number;
  isPastSeason: boolean;
  existing: PublishedWeekInjuriesDto | null;
}

interface PublishInjuriesOptions {
  files: JsonFiles;
  nflState: NflStateDto;
  players: PlayerDirectory;
  runsUntilDone: boolean;
}

export async function publishInjuries({ files, nflState, players, runsUntilDone }: PublishInjuriesOptions): Promise<void> {
  const publishedKeys = new Set<string>();

  while (true) {
    const pending = (await getWeeksToPublish(files, nflState)).filter(week => !publishedKeys.has(toWeekKey(week)));
    if (pending.length === 0) return;

    const published = await publishWeeks(files, pending.slice(0, MAX_WEEKS_PER_BATCH), players);
    published.forEach(week => publishedKeys.add(toWeekKey(week)));

    const remaining = pending.length - published.length;
    if (remaining === 0) return;
    if (!runsUntilDone || published.length === 0) {
      console.log(`${remaining} weeks left for the next runs`);
      return;
    }
    console.log(`${remaining} weeks left, pausing before the next batch`);
    await wait(PAUSE_BETWEEN_BATCHES_MS);
  }
}

async function getWeeksToPublish(files: JsonFiles, nflState: NflStateDto): Promise<WeekToPublish[]> {
  const currentSeason = Number(nflState.season);
  const lastWeekSoFar = getLastRegularSeasonWeekSoFar(nflState);

  const candidates = range(FIRST_SLEEPER_SEASON, currentSeason).reverse().flatMap(season => {
    const isPastSeason = season !== currentSeason;
    return range(1, isPastSeason ? DEFAULT_WEEK_COUNT : lastWeekSoFar).map(week => ({
      season: String(season),
      week,
      isPastSeason,
      isRecent: !isPastSeason && week > lastWeekSoFar - REPROCESSED_RECENT_WEEKS
    }));
  });

  const withExisting = await Promise.all(candidates.map(async candidate => ({
    ...candidate,
    existing: await files.read<PublishedWeekInjuriesDto>(getPublishedWeekInjuriesPath(candidate.season, candidate.week))
  })));

  return withExisting
    .filter(({ isRecent, existing }) => isRecent || !isUpToDate(existing))
    .map(({ season, week, isPastSeason, existing }) => ({ season, week, isPastSeason, existing }));
}

async function publishWeeks(files: JsonFiles, weeks: WeekToPublish[], players: PlayerDirectory): Promise<WeekToPublish[]> {
  const published: WeekToPublish[] = [];

  for (const weekToPublish of weeks) {
    const { season, week, existing } = weekToPublish;
    try {
      const weekInjuries = await toPublishedWeekInjuries(weekToPublish, players);
      const summary = `${season} week ${week}: ${weekInjuries.sleeperIds.length} players left injured (${weekInjuries.complete ? 'complete' : 'partial'})`;
      if (hasSameInjuries(existing, weekInjuries)) {
        console.log(`${summary}, unchanged`);
      } else {
        await files.write(getPublishedWeekInjuriesPath(season, week), weekInjuries);
        console.log(summary);
      }
      published.push(weekToPublish);
    } catch (error) {
      console.log(`::warning::${season} week ${week} skipped until the next run: ${error instanceof Error ? error.message : error}`);
    }
    await wait(PAUSE_BETWEEN_WEEKS_MS);
  }

  return published;
}

async function toPublishedWeekInjuries({ season, week, isPastSeason }: WeekToPublish, players: PlayerDirectory): Promise<PublishedWeekInjuriesDto> {
  const { injuredPlayers, isComplete } = await loadEspnWeekInjuries(season, week);
  return {
    updatedAt: new Date().toISOString(),
    parserVersion: INJURY_PARSER_VERSION,
    season,
    week,
    complete: isPastSeason || isComplete,
    sleeperIds: toSleeperIdsOutForGame(injuredPlayers, players).sort()
  };
}

function isUpToDate(existing: PublishedWeekInjuriesDto | null): boolean {
  return !!existing?.complete && existing.parserVersion === INJURY_PARSER_VERSION;
}

function hasSameInjuries(existing: PublishedWeekInjuriesDto | null, updated: PublishedWeekInjuriesDto): boolean {
  return !!existing
    && existing.parserVersion === updated.parserVersion
    && existing.complete === updated.complete
    && existing.sleeperIds.join() === updated.sleeperIds.join();
}

function getLastRegularSeasonWeekSoFar(nflState: NflStateDto): number {
  if (nflState.season_type === 'regular') return nflState.week;
  if (nflState.season_type === 'post') return DEFAULT_WEEK_COUNT;
  return 0;
}

function toWeekKey({ season, week }: WeekToPublish): string {
  return `${season}-${week}`;
}

export type StoredWeeks<T> = Record<string, T>;

export interface WeeklyStore<T> {
  stored: StoredWeeks<T>;
  write: (weeks: StoredWeeks<T>) => void;
}

interface WeeklyLoadOptions<T> {
  weeks: number[];
  liveWeek: number | null;
  stored: StoredWeeks<T>;
  fetchWeek: (week: number) => Promise<T | null>;
}

export function withLiveWeek(completedWeeks: number[], liveWeek: number | null): number[] {
  return liveWeek !== null && !completedWeeks.includes(liveWeek) ? [...completedWeeks, liveWeek] : completedWeeks;
}

export async function loadWeeks<T>({ weeks, liveWeek, stored, fetchWeek }: WeeklyLoadOptions<T>): Promise<Map<number, T>> {
  const loaded = await Promise.all(weeks.map(async (week): Promise<[number, T | null]> => {
    const isStillChanging = week === liveWeek;
    const cached = isStillChanging ? undefined : stored[week];
    return [week, cached ?? await fetchWeek(week)];
  }));
  return new Map(loaded.filter((entry): entry is [number, T] => entry[1] !== null));
}

export function toStoredWeeks<T>(loaded: Map<number, T>, weeks: number[], prepare: (value: T, week: number) => T): StoredWeeks<T> {
  return Object.fromEntries(weeks.flatMap(week => {
    const value = loaded.get(week);
    return value === undefined ? [] : [[week, prepare(value, week)]];
  }));
}

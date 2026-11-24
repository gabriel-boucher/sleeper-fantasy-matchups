export function wait(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

export async function withRetries<T>(load: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await load();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await wait(delayMs * attempt);
    }
  }
}

export async function mapWithConcurrency<T, R>(items: T[], limit: number, mapItem: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function work() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapItem(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, work));
  return results;
}

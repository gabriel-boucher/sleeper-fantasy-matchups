import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface JsonFiles {
  read: <T>(path: string) => Promise<T | null>;
  write: (path: string, value: unknown) => Promise<void>;
}

export function createJsonFiles(rootDir: string): JsonFiles {
  return {
    async read<T>(path: string): Promise<T | null> {
      try {
        return JSON.parse(await readFile(join(rootDir, path), 'utf8')) as T;
      } catch {
        return null;
      }
    },
    async write(path: string, value: unknown): Promise<void> {
      const filePath = join(rootDir, path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify(value));
    }
  };
}

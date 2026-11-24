import { groupBy } from '../../utils/collections';
import { PlayName } from './espnModels';

const NAME_SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v']);

export interface NamedPlayer<T> {
  team: string;
  firstName: string;
  lastName: string;
  value: T;
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = '', ...lastNames] = fullName.trim().split(/\s+/);
  return { firstName, lastName: lastNames.join(' ') };
}

export function createPlayNameLookup<T>(players: NamedPlayer<T>[]): (name: PlayName) => T | null {
  const playersByTeamAndLastName = groupBy(players, player => toLookupKey(player.team, normalizeName(player.lastName)));

  return ({ team, shortName }) => {
    const [initials = '', ...lastNameParts] = shortName.split('.');
    const candidates = playersByTeamAndLastName.get(toLookupKey(team, normalizeName(lastNameParts.join('.')))) ?? [];
    const matches = candidates.filter(player => normalizeName(player.firstName).startsWith(normalizeName(initials)));
    return matches.length === 1 ? matches[0].value : null;
  };
}

function toLookupKey(team: string, normalizedLastName: string): string {
  return `${team}|${normalizedLastName}`;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(part => !NAME_SUFFIXES.has(part.replace(/\./g, '')))
    .join(' ')
    .replace(/[^a-z ]/g, '')
    .trim();
}

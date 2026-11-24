import { BracketMatchSpec, BracketSource } from '../../types/models';
import { BracketMatchDto, BracketSourceDto } from './sleeperDto';

export function toBracketMatchSpecs(matchDtos: BracketMatchDto[]): BracketMatchSpec[] {
  return matchDtos.map(matchDto => ({
    id: matchDto.m,
    round: matchDto.r,
    place: matchDto.p ?? null,
    sources: [toSource(matchDto.t1_from, matchDto.t1), toSource(matchDto.t2_from, matchDto.t2)],
    recordedWinner: matchDto.w ?? null
  }));
}

function toSource(from: BracketSourceDto | null | undefined, rosterId: number | null): BracketSource | null {
  if (from?.w !== undefined) return { kind: 'winner', matchId: from.w };
  if (from?.l !== undefined) return { kind: 'loser', matchId: from.l };
  return rosterId === null ? null : { kind: 'seed', rosterId };
}

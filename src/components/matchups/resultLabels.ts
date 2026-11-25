import { MatchupResult } from '../../domain/matchups';
import { MISSING_VALUE } from '../../utils/format';

export const RESULT_LABELS: Record<MatchupResult, string> = {
  win: 'W',
  loss: 'L',
  tie: 'T',
  unplayed: MISSING_VALUE
};

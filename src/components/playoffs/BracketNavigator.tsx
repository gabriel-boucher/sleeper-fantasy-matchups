import { BracketKind } from '../../domain/playoffs';
import { StepDirection, StepNavigator } from '../common/StepNavigator';
import { BRACKET_LABELS } from './playoffLabels';

const BRACKET_KINDS: BracketKind[] = ['winners', 'toiletBowl'];

interface BracketNavigatorProps {
  kind: BracketKind;
  onChange: (kind: BracketKind) => void;
}

function getArrowLabel(direction: StepDirection, kind: BracketKind | undefined): string {
  return kind ? `Show ${BRACKET_LABELS[kind].toLowerCase()}` : `No ${direction} bracket`;
}

export function BracketNavigator({ kind, onChange }: BracketNavigatorProps) {
  return (
    <StepNavigator
      steps={BRACKET_KINDS}
      value={kind}
      onChange={onChange}
      getArrowLabel={getArrowLabel}
      labelClassName="playoff-navigator-label"
    >
      {BRACKET_LABELS[kind]}
    </StepNavigator>
  );
}

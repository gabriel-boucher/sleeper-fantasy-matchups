import { ConfirmedOutcome } from '../../domain/playoffClinching';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { DashCircleIcon } from '../icons/DashCircleIcon';
import './ConfirmedOutcomeBadge.css';

const DESCRIPTIONS: Record<ConfirmedOutcome, string> = {
  playoffs: 'Clinched a playoff spot',
  toiletBowl: 'Out of the playoffs: headed to the toilet bowl'
};

interface ConfirmedOutcomeBadgeProps {
  outcome: ConfirmedOutcome;
}

export function ConfirmedOutcomeBadge({ outcome }: ConfirmedOutcomeBadgeProps) {
  const description = DESCRIPTIONS[outcome];
  return (
    <span className={`confirmed-outcome-badge ${outcome}`} role="img" title={description} aria-label={description}>
      {outcome === 'playoffs' ? <CheckCircleIcon /> : <DashCircleIcon />}
    </span>
  );
}

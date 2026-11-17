import { formatCount } from '../../utils/format';
import './LuckBadge.css';

type LuckKind = 'luckiest' | 'unluckiest';

const LABELS: Record<LuckKind, string> = {
  luckiest: 'Luckiest',
  unluckiest: 'Unluckiest'
};

interface LuckBadgeProps {
  kind: LuckKind;
  spotsGainedInAllPlay: number;
}

export function LuckBadge({ kind, spotsGainedInAllPlay }: LuckBadgeProps) {
  const spots = formatCount(Math.abs(spotsGainedInAllPlay), 'spot');
  const realRankComparedToAllPlay = spotsGainedInAllPlay > 0 ? 'lower' : 'higher';
  const description = `${LABELS[kind]}: ${spots} ${realRankComparedToAllPlay} in the real standings than in all-play`;

  return (
    <span className="luck-badge" role="img" title={description} aria-label={description}>
      <LuckIcon kind={kind} />
    </span>
  );
}

export function LuckIcon({ kind }: { kind: LuckKind }) {
  return (
    <svg className={`luck-icon ${kind}`} viewBox="0 0 18 18" aria-hidden="true">
      {kind === 'luckiest' ? <Clover /> : <RainCloud />}
    </svg>
  );
}

function Clover() {
  return (
    <>
      <circle cx="5.6" cy="5.6" r="3.4" />
      <circle cx="11.4" cy="5.6" r="3.4" />
      <circle cx="5.6" cy="11.4" r="3.4" />
      <circle cx="11.4" cy="11.4" r="3.4" />
      <path className="luck-icon-stroke" d="M9.5 9.5c2 2.5 3.5 4.5 6.5 6.5" />
    </>
  );
}

function RainCloud() {
  return (
    <>
      <path d="M5 10.5a3 3 0 0 1 .4-6 4.2 4.2 0 0 1 8 1.2 2.5 2.5 0 0 1-.4 4.8z" />
      <path className="luck-icon-stroke rain" d="M6 13l-1 3M9.5 13l-1 3M13 13l-1 3" />
    </>
  );
}

import { formatCount } from '../../utils/format';
import './LuckBadge.css';

const BADGES = {
  luckiest: { icon: '🍀', label: 'Luckiest' },
  unluckiest: { icon: '🌧️', label: 'Unluckiest' }
};

interface LuckBadgeProps {
  kind: keyof typeof BADGES;
  spotsGainedInAllPlay: number;
}

export function LuckBadge({ kind, spotsGainedInAllPlay }: LuckBadgeProps) {
  const { icon, label } = BADGES[kind];
  const spots = formatCount(Math.abs(spotsGainedInAllPlay), 'spot');
  const realRankComparedToAllPlay = spotsGainedInAllPlay > 0 ? 'lower' : 'higher';
  const description = `${label}: ${spots} ${realRankComparedToAllPlay} in the real standings than in all-play`;

  return (
    <span className="luck-badge" role="img" title={description} aria-label={description}>
      {icon}
    </span>
  );
}

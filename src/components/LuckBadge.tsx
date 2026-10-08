const BADGES = {
  luckiest: { icon: '🍀', label: 'Luckiest' },
  unluckiest: { icon: '🌧️', label: 'Unluckiest' }
};

interface LuckBadgeProps {
  kind: 'luckiest' | 'unluckiest';
  // Spots gained in all-play compared to the real standings
  rankChange: number;
}

export function LuckBadge({ kind, rankChange }: LuckBadgeProps) {
  const { icon, label } = BADGES[kind];
  const spots = Math.abs(rankChange);
  const description = `${label}: ${spots} spot${spots > 1 ? 's' : ''} ${rankChange > 0 ? 'lower' : 'higher'} in the real standings than in all-play`;

  return (
    <span className="luck-badge" role="img" title={description} aria-label={description}>
      {icon}
    </span>
  );
}

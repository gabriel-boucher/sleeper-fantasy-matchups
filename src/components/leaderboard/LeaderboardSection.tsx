import { useEffect, useMemo, useState } from 'react';
import { UserId } from '../../data/data';
import { getAllPlayLeaderboard, getLeaderboardWeeks } from '../../data/leaderboard';
import { Season } from '../../services/seasonService';
import { readUrlParam, updateUrlParams } from '../../utils/urlParams';
import { Segment, SegmentedControl } from '../common/SegmentedControl';
import { Leaderboard } from './Leaderboard';
import { WeekNavigator } from './WeekNavigator';

type LeaderboardView = 'season' | 'week';

const VIEWS: Segment<LeaderboardView>[] = [
  { value: 'season', label: 'Season' },
  { value: 'week', label: 'Week by week' }
];

interface LeaderboardSectionProps {
  season: Season;
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

// A shared link with a valid `week` opens straight on that week
function getInitialWeek(weeks: number[]): number | null {
  const linkedWeek = Number(readUrlParam('week'));
  return weeks.includes(linkedWeek) ? linkedWeek : null;
}

export function LeaderboardSection({ season, selectedUserId, onSelectUser }: LeaderboardSectionProps) {
  const weeks = useMemo(
    () => getLeaderboardWeeks(season.matchups, season.lastRegularSeasonWeek),
    [season]
  );
  const [initialWeek] = useState(() => getInitialWeek(weeks));
  const [view, setView] = useState<LeaderboardView>(initialWeek ? 'week' : 'season');
  // Starts on the latest week so switching views shows the most recent results
  const [week, setWeek] = useState(initialWeek ?? weeks[weeks.length - 1] ?? 0);

  useEffect(() => {
    updateUrlParams({ week: view === 'week' ? String(week) : null });
  }, [view, week]);

  const entries = useMemo(
    () => view === 'season'
      ? getAllPlayLeaderboard(season.matchups, season.users, { from: 1, to: season.lastRegularSeasonWeek }, season.standings)
      : getAllPlayLeaderboard(season.matchups, season.users, { from: week, to: week }),
    [season, view, week]
  );

  if (weeks.length === 0) return null;

  return (
    <Leaderboard
      entries={entries}
      description={view === 'season'
        ? "What each team's record would be if it played everyone, every week of the regular season."
        : `Every team against every other score from week ${week}. Real is that week's actual results.`}
      controls={<SegmentedControl label="Leaderboard view" segments={VIEWS} value={view} onChange={setView} />}
      toolbar={view === 'week' && <WeekNavigator weeks={weeks} week={week} onChange={setWeek} />}
      selectedUserId={selectedUserId}
      onSelectUser={onSelectUser}
    />
  );
}

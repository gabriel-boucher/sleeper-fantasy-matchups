import { useMemo, useState } from 'react';
import { Matchup, UserId } from '../../data/data';
import { getAllPlayLeaderboard, getLeaderboardWeeks, withLiveResults } from '../../data/leaderboard';
import { Season } from '../../services/seasonService';
import { readUrlParam } from '../../utils/urlParams';
import { useUrlParamsSync } from '../../hooks/useUrlParamsSync';
import { Segment, SegmentedControl } from '../common/SegmentedControl';
import { Toggle } from '../common/Toggle';
import { Leaderboard } from './Leaderboard';
import { WeekNavigator } from '../common/WeekNavigator';

type LeaderboardView = 'season' | 'week';

const VIEWS: Segment<LeaderboardView>[] = [
  { value: 'season', label: 'Season' },
  { value: 'week', label: 'Week by week' }
];

interface LeaderboardSectionProps {
  season: Season;
  // The week being played, with its latest scores
  liveMatchups: Matchup[];
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

export function LeaderboardSection({ season, liveMatchups, selectedUserId, onSelectUser }: LeaderboardSectionProps) {
  // Only a regular-season week in progress can be added; playoffs aren't part of the leaderboard
  const liveWeek = season.liveWeek !== null && season.liveWeek <= season.lastRegularSeasonWeek && liveMatchups.length > 0
    ? season.liveWeek
    : null;
  const [includeLive, setIncludeLive] = useState(() => readUrlParam('live') === '1');
  const isLiveIncluded = includeLive && liveWeek !== null;

  const matchups = useMemo(
    () => (isLiveIncluded ? [...season.matchups, ...liveMatchups] : season.matchups),
    [isLiveIncluded, season.matchups, liveMatchups]
  );
  const weeks = useMemo(() => getLeaderboardWeeks(matchups, season.lastRegularSeasonWeek), [matchups, season]);

  const [initialWeek] = useState(() => {
    // A shared link with a valid `week` opens straight on that week
    const linkedWeek = Number(readUrlParam('week'));
    return weeks.includes(linkedWeek) ? linkedWeek : null;
  });
  const [view, setView] = useState<LeaderboardView>(initialWeek ? 'week' : 'season');
  // Starts on the latest week so switching views shows the most recent results
  const [selectedWeek, setSelectedWeek] = useState(initialWeek ?? weeks[weeks.length - 1] ?? 0);
  // Turning the live week off while viewing it falls back to the latest finished week
  const week = weeks.includes(selectedWeek) ? selectedWeek : weeks[weeks.length - 1] ?? 0;

  useUrlParamsSync({ week: view === 'week' ? String(week) : null, live: isLiveIncluded ? '1' : null });

  const entries = useMemo(() => {
    if (view === 'week') return getAllPlayLeaderboard(matchups, season.users, { from: week, to: week });
    const standings = isLiveIncluded ? withLiveResults(season.standings, liveMatchups) : season.standings;
    return getAllPlayLeaderboard(matchups, season.users, { from: 1, to: season.lastRegularSeasonWeek }, standings);
  }, [view, week, matchups, season, isLiveIncluded, liveMatchups]);

  // Stays on the week being viewed; only leaving the live week itself moves back to the latest finished week
  function handleIncludeLiveChange(include: boolean) {
    setIncludeLive(include);
    if (!include && week === liveWeek) {
      setSelectedWeek(weeks.filter(w => w !== liveWeek).at(-1) ?? 0);
    }
  }

  if (weeks.length === 0) return null;

  const isViewingLiveWeek = isLiveIncluded && (view === 'season' || week === liveWeek);
  const description = view === 'season'
    ? "What each team's record would be if it played everyone, every week of the regular season."
    : `Every team against every other score from week ${week}. Real is that week's actual results.`;

  return (
    <Leaderboard
      entries={entries}
      description={isViewingLiveWeek ? `${description} Week ${liveWeek} is still being played.` : description}
      controls={
        <div className="leaderboard-controls">
          {liveWeek !== null && (
            <Toggle label={`Week ${liveWeek}`} checked={isLiveIncluded} onChange={handleIncludeLiveChange} />
          )}
          <SegmentedControl label="Leaderboard view" segments={VIEWS} value={view} onChange={setView} />
        </div>
      }
      toolbar={view === 'week' && <WeekNavigator weeks={weeks} week={week} onChange={setSelectedWeek} />}
      selectedUserId={selectedUserId}
      onSelectUser={onSelectUser}
    />
  );
}

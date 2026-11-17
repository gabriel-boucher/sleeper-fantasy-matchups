import { useMemo, useState } from 'react';
import { getAllPlayLeaderboard, getLeaderboardWeeks, withLiveResults } from '../../domain/leaderboard';
import { useUrlParamsSync } from '../../hooks/useUrlParamsSync';
import { Matchup, Season, UserId } from '../../types/models';
import { readUrlParam } from '../../utils/urlParams';
import { Segment, SegmentedControl } from '../common/SegmentedControl';
import { Toggle } from '../common/Toggle';
import { WeekNavigator } from '../common/WeekNavigator';
import { Leaderboard } from './Leaderboard';

type LeaderboardView = 'season' | 'week';

const VIEWS: Segment<LeaderboardView>[] = [
  { value: 'season', label: 'Season' },
  { value: 'week', label: 'Week by week' }
];

const LIVE_WEEK_INCLUDED_PARAM = '1';
const FIRST_WEEK = 1;
const NO_WEEK = 0;

interface LeaderboardSectionProps {
  season: Season;
  liveMatchups: Matchup[];
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

function getIncludableLiveWeek(season: Season, liveMatchups: Matchup[]): number | null {
  const { liveWeek, lastRegularSeasonWeek } = season;
  const isRegularSeasonWeekInProgress = liveWeek !== null && liveWeek <= lastRegularSeasonWeek && liveMatchups.length > 0;
  return isRegularSeasonWeekInProgress ? liveWeek : null;
}

function readWeekFromUrl(weeks: number[]): number | null {
  const linkedWeek = Number(readUrlParam('week'));
  return weeks.includes(linkedWeek) ? linkedWeek : null;
}

export function LeaderboardSection({ season, liveMatchups, selectedUserId, onSelectUser }: LeaderboardSectionProps) {
  const { completedMatchups, teamUsers, lastRegularSeasonWeek, officialStandings, hasMedianGame } = season;

  const liveWeek = getIncludableLiveWeek(season, liveMatchups);
  const [wantsLiveWeek, setWantsLiveWeek] = useState(() => readUrlParam('live') === LIVE_WEEK_INCLUDED_PARAM);
  const isLiveWeekIncluded = wantsLiveWeek && liveWeek !== null;

  const matchups = useMemo(
    () => (isLiveWeekIncluded ? [...completedMatchups, ...liveMatchups] : completedMatchups),
    [isLiveWeekIncluded, completedMatchups, liveMatchups]
  );
  const weeks = useMemo(() => getLeaderboardWeeks(matchups, lastRegularSeasonWeek), [matchups, lastRegularSeasonWeek]);
  const latestWeek = weeks[weeks.length - 1] ?? NO_WEEK;

  const [linkedWeek] = useState(() => readWeekFromUrl(weeks));
  const [view, setView] = useState<LeaderboardView>(linkedWeek ? 'week' : 'season');
  const [selectedWeek, setSelectedWeek] = useState(linkedWeek ?? latestWeek);
  const week = weeks.includes(selectedWeek) ? selectedWeek : latestWeek;

  useUrlParamsSync({
    week: view === 'week' ? String(week) : null,
    live: isLiveWeekIncluded ? LIVE_WEEK_INCLUDED_PARAM : null
  });

  const entries = useMemo(() => {
    if (view === 'week') {
      return getAllPlayLeaderboard(matchups, teamUsers, { from: week, to: week }, { hasMedianGame });
    }
    const standings = isLiveWeekIncluded ? withLiveResults(officialStandings, liveMatchups, hasMedianGame) : officialStandings;
    return getAllPlayLeaderboard(
      matchups,
      teamUsers,
      { from: FIRST_WEEK, to: lastRegularSeasonWeek },
      { officialStandings: standings, hasMedianGame }
    );
  }, [view, week, matchups, teamUsers, lastRegularSeasonWeek, officialStandings, hasMedianGame, isLiveWeekIncluded, liveMatchups]);

  function changeLiveWeekInclusion(isIncluded: boolean) {
    setWantsLiveWeek(isIncluded);
    const isLeavingViewedWeek = !isIncluded && week === liveWeek;
    if (isLeavingViewedWeek) setSelectedWeek(weeks.filter(w => w !== liveWeek).at(-1) ?? NO_WEEK);
  }

  if (weeks.length === 0) return null;

  const isShowingLiveResults = isLiveWeekIncluded && (view === 'season' || week === liveWeek);
  const viewDescription = view === 'season'
    ? "What each team's record would be if it played everyone, every week of the regular season."
    : `Every team against every other score from week ${week}. Real is that week's actual results.`;
  const description = isShowingLiveResults ? `${viewDescription} Week ${liveWeek} is still being played.` : viewDescription;

  return (
    <Leaderboard
      entries={entries}
      description={description}
      viewControls={
        <div className="leaderboard-controls">
          {liveWeek !== null && (
            <Toggle label={`Week ${liveWeek}`} checked={isLiveWeekIncluded} onChange={changeLiveWeekInclusion} />
          )}
          <SegmentedControl label="Leaderboard view" segments={VIEWS} value={view} onChange={setView} />
        </div>
      }
      weekNavigator={view === 'week' && <WeekNavigator weeks={weeks} week={week} onChange={setSelectedWeek} />}
      selectedUserId={selectedUserId}
      onSelectUser={onSelectUser}
    />
  );
}

import { useMemo, useState } from 'react';
import {
  COLUMN_GROUP_KEYS,
  COLUMN_GROUPS_HIDDEN_BY_DEFAULT,
  HIDDEN_COLUMN_GROUPS_STORAGE_KEY
} from '../../constants/leaderboardColumnGroups';
import { FIRST_WEEK } from '../../constants/weeks';
import { getAllPlayLeaderboard, getLeaderboardWeeks, withLiveResults } from '../../domain/leaderboard';
import { DEFAULT_SORT } from '../../domain/leaderboardSort';
import { useMidGameInjuries } from '../../hooks/useMidGameInjuries';
import { useStoredSet } from '../../hooks/useStoredSet';
import { useUrlParamsSync } from '../../hooks/useUrlParamsSync';
import { Matchup, Season, UserId } from '../../types/models';
import { readUrlParam } from '../../utils/urlParams';
import { Segment, SegmentedControl } from '../common/SegmentedControl';
import { Toggle } from '../common/Toggle';
import { WeekNavigator } from '../common/WeekNavigator';
import { Leaderboard } from './Leaderboard';
import { getColumnState } from './leaderboardColumns';
import { WeeklyTrend } from './WeeklyTrend';

type LeaderboardView = 'season' | 'week';

const VIEWS: Segment<LeaderboardView>[] = [
  { value: 'season', label: 'Season' },
  { value: 'week', label: 'Week by week' }
];

const LIVE_WEEK_INCLUDED_PARAM = '1';
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

  const hiddenGroups = useStoredSet(HIDDEN_COLUMN_GROUPS_STORAGE_KEY, COLUMN_GROUP_KEYS, COLUMN_GROUPS_HIDDEN_BY_DEFAULT);
  const { data: injuries, loading: isLoadingInjuries } = useMidGameInjuries(season, weeks, !hiddenGroups.keys.has('injuries'));
  const [sort, setSort] = useState(DEFAULT_SORT);

  const entries = useMemo(() => {
    if (view === 'week') {
      return getAllPlayLeaderboard(matchups, teamUsers, { from: week, to: week }, { hasMedianGame, injuries });
    }
    const standings = isLiveWeekIncluded ? withLiveResults(officialStandings, liveMatchups, hasMedianGame) : officialStandings;
    return getAllPlayLeaderboard(
      matchups,
      teamUsers,
      { from: FIRST_WEEK, to: lastRegularSeasonWeek },
      { officialStandings: standings, hasMedianGame, injuries }
    );
  }, [view, week, matchups, teamUsers, lastRegularSeasonWeek, officialStandings, hasMedianGame, injuries, isLiveWeekIncluded, liveMatchups]);

  const columnState = useMemo(
    () => getColumnState(entries, { isLoadingInjuries }, hiddenGroups.keys, sort),
    [entries, isLoadingInjuries, hiddenGroups.keys, sort]
  );
  const selectedUser = teamUsers.find(user => user.id === selectedUserId) ?? null;

  function changeLiveWeekInclusion(isIncluded: boolean) {
    setWantsLiveWeek(isIncluded);
    const isLeavingViewedWeek = !isIncluded && week === liveWeek;
    if (isLeavingViewedWeek) setSelectedWeek(weeks.filter(w => w !== liveWeek).at(-1) ?? NO_WEEK);
  }

  if (weeks.length === 0) return null;

  return (
    <Leaderboard
      entries={entries}
      viewControls={
        <>
          {liveWeek !== null && (
            <Toggle label={`Week ${liveWeek}`} checked={isLiveWeekIncluded} onChange={changeLiveWeekInclusion} />
          )}
          <SegmentedControl label="Leaderboard view" segments={VIEWS} value={view} onChange={setView} />
        </>
      }
      weekNavigator={view === 'week' && <WeekNavigator weeks={weeks} week={week} onChange={setSelectedWeek} />}
      hiddenGroups={hiddenGroups}
      columnState={columnState}
      onSortChange={setSort}
      selectedUserId={selectedUserId}
      onSelectUser={onSelectUser}
      footer={selectedUser && (
        <WeeklyTrend
          matchups={matchups}
          user={selectedUser}
          columns={columnState.availableColumns}
          hasMedianGame={hasMedianGame}
          injuries={injuries}
        />
      )}
    />
  );
}

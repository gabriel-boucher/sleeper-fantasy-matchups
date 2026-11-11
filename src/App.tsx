import './App.css';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { UserId } from './data/data';
import { useAsync } from './hooks/useAsync';
import { findUserLeagues } from './services/leagueService';
import { getUserById } from './services/sleeperApi';
import { UsernameForm } from './components/search/UsernameForm';
import { HomePage } from './components/home/HomePage';
import { LeagueBrowser } from './components/league/LeagueBrowser';
import { ErrorMessage } from './components/common/StatusMessage';
import { TeamActionsProvider } from './components/common/TeamLinks';
import { readUrlParam, updateUrlParams } from './utils/urlParams';

// Wrapped in an object so submitting the same username again retries the search
interface UsernameSearch {
  username: string;
}

const searchLeagues = (search: UsernameSearch) => findUserLeagues(search.username);

// A shared link opens straight on its user's leagues
function getInitialSearch(): UsernameSearch | null {
  const username = readUrlParam('user');
  return username ? { username } : null;
}

function App() {
  const [search, setSearch] = useState(getInitialSearch);
  const { data: userLeagues, loading, error } = useAsync(search, searchLeagues);

  const [switchError, setSwitchError] = useState<string | null>(null);

  // Bumped on Back/Forward so the league browser remounts and reads its league, season, team and
  // week from the URL again
  const [historyVisit, setHistoryVisit] = useState(0);

  // Back/Forward: show the view the URL now describes. Another user means a new search; the same
  // user keeps their loaded leagues and only the selections below are restored.
  useEffect(() => {
    function handlePopState() {
      setSwitchError(null);
      const next = getInitialSearch();
      setSearch(current => (current && next && current.username === next.username ? current : next));
      setHistoryVisit(n => n + 1);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function handleSearch(username: string) {
    // A new user starts from scratch, so drop the previous user's selections
    updateUrlParams({ user: username, league: null, season: null, team: null, vs: null, week: null, live: null }, { push: true });
    setSwitchError(null);
    setSearch({ username });
  }

  // The title goes back to the start page without reloading (a real link, so it can open in a new tab too)
  function handleHome(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    updateUrlParams({ user: null, league: null, season: null, team: null, vs: null, week: null, live: null }, { push: true });
    setSwitchError(null);
    setSearch(null);
    window.scrollTo({ top: 0 });
  }

  // Clicking a league member's username: look up their leagues, staying on this league and season
  // with their own team selected. League members only come with a display name, so their actual
  // username is looked up first.
  const switchUser = useCallback(async (userId: UserId) => {
    try {
      const user = await getUserById(userId);
      if (!user) throw new Error('This Sleeper user no longer exists');
      updateUrlParams({ user: user.username, team: userId, vs: null }, { push: true });
      setSwitchError(null);
      setSearch({ username: user.username });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : 'Could not switch user');
    }
  }, []);

  return (
    <>
      <header className="navbar">
        <div className={search ? 'navbar-inner' : 'navbar-inner navbar-inner--centered'}>
          <h1 className="navbar-title">
            <a href="/" className="navbar-home" onClick={handleHome}>Fantasy Cope Machine</a>
          </h1>
          {/* The home page has its own big search box. Keyed so the box shows the new username after switching users */}
          {search && (
            <UsernameForm key={search.username} initialUsername={search.username} loading={loading} onSubmit={handleSearch} />
          )}
        </div>
      </header>

      <main className="app">
        {!search && <HomePage loading={loading} onSearch={handleSearch} />}
        {(error ?? switchError) && <ErrorMessage error={error ?? switchError ?? ''} />}
        <TeamActionsProvider switchUser={switchUser}>
          {userLeagues && <LeagueBrowser key={`${userLeagues.userId}-${historyVisit}`} userLeagues={userLeagues} />}
        </TeamActionsProvider>
      </main>
    </>
  );
}

export default App;

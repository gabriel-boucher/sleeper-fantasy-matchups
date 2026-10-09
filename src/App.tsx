import './App.css';
import { useState } from 'react';
import { useAsync } from './hooks/useAsync';
import { findUserLeagues } from './services/leagueService';
import { UsernameForm } from './components/search/UsernameForm';
import { LeagueBrowser } from './components/league/LeagueBrowser';
import { ErrorMessage } from './components/common/StatusMessage';
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

  function handleSearch(username: string) {
    // A new user starts from scratch, so drop the previous user's selections
    updateUrlParams({ user: username, league: null, season: null, team: null, vs: null, week: null });
    setSearch({ username });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Fantasy Matchups</h1>
        <p className="app-subtitle">See any Sleeper team's weekly results, or how it would have done against someone else's schedule.</p>
        <UsernameForm initialUsername={search?.username} loading={loading} onSubmit={handleSearch} />
      </header>

      <main className="app-main">
        {error && <ErrorMessage error={error} />}
        {userLeagues && <LeagueBrowser key={userLeagues.userId} userLeagues={userLeagues} />}
      </main>
    </div>
  );
}

export default App;

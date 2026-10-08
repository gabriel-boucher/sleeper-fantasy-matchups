import './App.css';
import { useState } from 'react';
import { useAsync } from './hooks/useAsync';
import { findUserLeagues } from './services/leagueService';
import { UsernameForm } from './components/UsernameForm';
import { LeagueBrowser } from './components/LeagueBrowser';
import { ErrorMessage } from './components/StatusMessage';

// Wrapped in an object so submitting the same username again retries the search
interface UsernameSearch {
  username: string;
}

const searchLeagues = (search: UsernameSearch) => findUserLeagues(search.username);

function App() {
  const [search, setSearch] = useState<UsernameSearch | null>(null);
  const { data: userLeagues, loading, error } = useAsync(search, searchLeagues);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Fantasy Matchups</h1>
        <p className="app-subtitle">See any Sleeper team's weekly results, or how it would have done against someone else's schedule.</p>
        <UsernameForm loading={loading} onSubmit={(username) => setSearch({ username })} />
      </header>

      <main className="app-main">
        {error && <ErrorMessage error={error} />}
        {userLeagues && <LeagueBrowser key={userLeagues.userId} userLeagues={userLeagues} />}
      </main>
    </div>
  );
}

export default App;

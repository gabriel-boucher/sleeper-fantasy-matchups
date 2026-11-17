import { MouseEvent } from 'react';
import { ErrorMessage } from './components/common/StatusMessage';
import { HomePage } from './components/home/HomePage';
import { LeagueBrowser } from './components/league/LeagueBrowser';
import { UsernameForm } from './components/search/UsernameForm';
import { TeamActionsProvider } from './context/TeamActionsProvider';
import { useUserSearch } from './hooks/useUserSearch';
import './App.css';

const PRIMARY_MOUSE_BUTTON = 0;

function opensInNewTabOrWindow(e: MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button !== PRIMARY_MOUSE_BUTTON;
}

function App() {
  const { username, userLeagues, loading, error, historyNavigationCount, searchUser, goHome, switchToLeagueMember } = useUserSearch();
  const isHomePage = username === null;

  function handleTitleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (opensInNewTabOrWindow(e)) return;
    e.preventDefault();
    goHome();
  }

  return (
    <>
      <header className="navbar">
        <div className={isHomePage ? 'navbar-inner navbar-inner--centered' : 'navbar-inner'}>
          <h1 className="navbar-title">
            <a href="/" className="navbar-home" onClick={handleTitleClick}>Fantasy Cope Machine</a>
          </h1>
          {!isHomePage && (
            <UsernameForm key={username} initialUsername={username} loading={loading} onSubmit={searchUser} />
          )}
        </div>
      </header>

      <main className="app">
        {isHomePage && <HomePage loading={loading} onSearch={searchUser} />}
        {error && <ErrorMessage error={error} />}
        <TeamActionsProvider switchUser={switchToLeagueMember}>
          {userLeagues && (
            <LeagueBrowser key={`${userLeagues.userId}-${historyNavigationCount}`} userLeagues={userLeagues} />
          )}
        </TeamActionsProvider>
      </main>
    </>
  );
}

export default App;

import { LeagueBrowser } from '../components/league/LeagueBrowser';
import { Navbar } from '../components/layout/Navbar';
import { PageContent } from '../components/layout/PageContent';
import { SearchErrorMessage } from '../components/search/SearchErrorMessage';
import { TeamActionsProvider } from '../context/TeamActionsProvider';
import { useUserSearchContext } from '../context/userSearchContext';

interface MainPageProps {
  username: string;
}

export function MainPage({ username }: MainPageProps) {
  const { userLeagues, historyNavigationCount, switchToLeagueMember } = useUserSearchContext();

  return (
    <>
      <Navbar username={username} />
      <PageContent>
        <SearchErrorMessage />
        <TeamActionsProvider switchUser={switchToLeagueMember}>
          {userLeagues && (
            <LeagueBrowser key={`${userLeagues.userId}-${historyNavigationCount}`} userLeagues={userLeagues} />
          )}
        </TeamActionsProvider>
      </PageContent>
    </>
  );
}

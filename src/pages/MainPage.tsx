import { Navbar } from '../components/layout/Navbar';
import { PageContent } from '../components/layout/PageContent';
import { LeagueBrowser } from '../components/league/LeagueBrowser';
import { SearchErrorMessage } from '../components/search/SearchErrorMessage';
import { TeamSelectionProvider } from '../context/TeamSelectionProvider';
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
        <TeamSelectionProvider switchUser={switchToLeagueMember}>
          {userLeagues && (
            <LeagueBrowser key={`${userLeagues.userId}-${historyNavigationCount}`} userLeagues={userLeagues} />
          )}
        </TeamSelectionProvider>
      </PageContent>
    </>
  );
}

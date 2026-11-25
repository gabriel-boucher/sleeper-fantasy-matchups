import { useUserSearchContext } from './context/userSearchContext';
import { UserSearchProvider } from './context/UserSearchProvider';
import { HomePage } from './pages/HomePage';
import { MainPage } from './pages/MainPage';

function CurrentPage() {
  const { username } = useUserSearchContext();
  return username === null ? <HomePage /> : <MainPage username={username} />;
}

function App() {
  return (
    <UserSearchProvider>
      <CurrentPage />
    </UserSearchProvider>
  );
}

export default App;

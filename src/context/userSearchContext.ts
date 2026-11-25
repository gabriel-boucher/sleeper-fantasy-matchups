import { createContext, useContext } from 'react';
import { UserSearch } from '../hooks/useUserSearch';

export const UserSearchContext = createContext<UserSearch | null>(null);

export function useUserSearchContext(): UserSearch {
  const userSearch = useContext(UserSearchContext);
  if (!userSearch) throw new Error('useUserSearchContext must be used inside a UserSearchProvider');
  return userSearch;
}

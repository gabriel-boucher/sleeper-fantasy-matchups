import { createContext, useContext } from 'react';
import { UserSearchState } from '../hooks/useUserSearch';

export const UserSearchContext = createContext<UserSearchState | null>(null);

export function useUserSearchContext(): UserSearchState {
  const userSearch = useContext(UserSearchContext);
  if (!userSearch) throw new Error('useUserSearchContext must be used inside a UserSearchProvider');
  return userSearch;
}

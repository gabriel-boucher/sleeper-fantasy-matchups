import { ReactNode } from 'react';
import { useUserSearch } from '../hooks/useUserSearch';
import { UserSearchContext } from './userSearchContext';

interface UserSearchProviderProps {
  children: ReactNode;
}

export function UserSearchProvider({ children }: UserSearchProviderProps) {
  const userSearch = useUserSearch();
  return <UserSearchContext.Provider value={userSearch}>{children}</UserSearchContext.Provider>;
}

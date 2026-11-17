import { useCallback, useEffect, useState } from 'react';
import { findUserLeagues, findUsername } from '../services/leagueService';
import { UserId } from '../types/models';
import { CLEARED_LEAGUE_PARAMS, readUrlParam, updateUrlParams } from '../utils/urlParams';
import { useAsync } from './useAsync';

interface SearchAttempt {
  username: string;
}

const findLeagues = (attempt: SearchAttempt) => findUserLeagues(attempt.username);

function readSearchAttemptFromUrl(): SearchAttempt | null {
  const username = readUrlParam('user');
  return username ? { username } : null;
}

function scrollToTop(): void {
  window.scrollTo({ top: 0 });
}

export function useUserSearch() {
  const [attempt, setAttempt] = useState(readSearchAttemptFromUrl);
  const { data: userLeagues, loading, error: searchError } = useAsync(attempt, findLeagues);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [historyNavigationCount, setHistoryNavigationCount] = useState(0);

  useEffect(() => {
    function restoreSearchFromUrl() {
      const fromUrl = readSearchAttemptFromUrl();
      setSwitchError(null);
      setAttempt(current => (current && fromUrl && current.username === fromUrl.username ? current : fromUrl));
      setHistoryNavigationCount(count => count + 1);
    }

    window.addEventListener('popstate', restoreSearchFromUrl);
    return () => window.removeEventListener('popstate', restoreSearchFromUrl);
  }, []);

  function searchUser(username: string) {
    updateUrlParams({ user: username, ...CLEARED_LEAGUE_PARAMS }, { addHistoryEntry: true });
    setSwitchError(null);
    setAttempt({ username });
  }

  function goHome() {
    updateUrlParams({ user: null, ...CLEARED_LEAGUE_PARAMS }, { addHistoryEntry: true });
    setSwitchError(null);
    setAttempt(null);
    scrollToTop();
  }

  const switchToLeagueMember = useCallback(async (userId: UserId) => {
    try {
      const username = await findUsername(userId);
      updateUrlParams({ user: username, team: userId, vs: null }, { addHistoryEntry: true });
      setSwitchError(null);
      setAttempt({ username });
      scrollToTop();
    } catch (error) {
      setSwitchError(error instanceof Error ? error.message : 'Could not switch user');
    }
  }, []);

  return {
    username: attempt?.username ?? null,
    userLeagues,
    loading,
    error: searchError ?? switchError,
    historyNavigationCount,
    searchUser,
    goHome,
    switchToLeagueMember
  };
}

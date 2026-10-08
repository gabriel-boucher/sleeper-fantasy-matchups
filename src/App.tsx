import './App.css';
import { useEffect, useState, useMemo } from 'react';
import { getMatchups, getDraft, getUsers } from './services/sleeperApi';
import { MatchupCard } from './components/MatchupCard';
import { Matchup, User, WEEKCOUNT } from './data/data';
import { toMatchup, toUser } from './data/mappers';

function App() {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedOpponentUser, setSelectedOpponentUser] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [userDtos, draftDto] = await Promise.all([getUsers(), getDraft()]);

        const allMatchups: Matchup[] = [];
        for (let week = 1; week <= WEEKCOUNT; week++) {
          const matchupDtos = await getMatchups(week);
          allMatchups.push(...toMatchup(draftDto, userDtos, matchupDtos, week));
        }

        setUsers(userDtos.map(toUser));
        setMatchups(allMatchups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { filteredMatchups, wins, losses } = useMemo(() => {
    if (!selectedUser) return { filteredMatchups: [], wins: 0, losses: 0 };

    const userMatchups = matchups
      .filter(m => m.team.user.display_name === selectedUser || m.team.user.team_name === selectedUser)
      .sort((a, b) => a.week - b.week);

    const opponentMatchups = selectedOpponentUser
      ? matchups
          .filter(m => m.team.user.display_name === selectedOpponentUser || m.team.user.team_name === selectedOpponentUser)
          .sort((a, b) => a.week - b.week)
      : [];

    const filtered = userMatchups.map((m, i) => {
      const opponentMatchup = opponentMatchups[i];
      if (!opponentMatchup) return m;
      // If the selected opponent played the selected user that week, show them head-to-head
      const playedEachOther = opponentMatchup.opponent.user.user_id === m.team.user.user_id;
      return {
        ...m,
        opponent: playedEachOther ? opponentMatchup.team : opponentMatchup.opponent
      };
    });

    const record = filtered.reduce(
      (acc, m) => {
        if (m.team.points > m.opponent.points) acc.wins++;
        else if (m.team.points < m.opponent.points) acc.losses++;
        return acc;
      },
      { wins: 0, losses: 0 }
    );

    return { filteredMatchups: filtered, ...record };
  }, [selectedUser, selectedOpponentUser, matchups]);

  if (loading) {
    return <div className="loading-container">Loading matchups...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <h1 className="app-header">Fantasy League Matchups</h1>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="user-select" className="filter-label">User</label>
          <select
            id="user-select"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setSelectedOpponentUser('');
            }}
            className="filter-select"
          >
            <option value="">-- Select a user --</option>
            {users.map(user => (
              <option key={user.user_id} value={user.team_name || user.display_name}>
                {user.team_name || user.display_name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="opponent-select" className="filter-label">Oponent</label>
          <select
            id="opponent-select"
            value={selectedOpponentUser}
            onChange={(e) => setSelectedOpponentUser(e.target.value)}
            disabled={!selectedUser}
            className="filter-select"
          >
            <option value="">-- Use own matchups --</option>
            {users
              .filter(user => user.team_name !== selectedUser && user.display_name !== selectedUser)
              .map(user => (
                <option key={user.user_id} value={user.team_name || user.display_name}>
                  {user.team_name || user.display_name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedUser && (
        <>
          <div className="matchups-container">
            {filteredMatchups.map((matchup) => (
              <MatchupCard
                key={`${matchup.week}-${matchup.team.user.user_id}`}
                team1={matchup.team}
                team2={matchup.opponent}
                week={matchup.week}
              />
            ))}
          </div>

          <div className="record-container">
            {wins}W - {losses}L
            {selectedOpponentUser && (
              <div className="record-subtitle">
                (Against {selectedOpponentUser}'s opponents)
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
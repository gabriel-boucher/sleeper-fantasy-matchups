import { UserId } from '../data/data';
import { getLuckExtremes, getRankChange, LeaderboardEntry } from '../data/leaderboard';
import { getTeamName } from '../data/matchupAnalysis';
import { LuckBadge } from './LuckBadge';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

export function Leaderboard({ entries, selectedUserId, onSelectUser }: LeaderboardProps) {
  if (entries.length === 0) return null;
  const hasTies = entries.some(e => e.record.ties > 0);
  const { luckiest, unluckiest } = getLuckExtremes(entries);

  return (
    <section className="panel leaderboard">
      <h2 className="section-title">All-play leaderboard</h2>
      <p className="leaderboard-description">
        Every regular-season week, each team plays every other team's score. PF and PA are the actual
        regular-season totals, and PF breaks ties in wins. The arrow shows how this ranking compares to the real standings:
        the biggest climb is the unluckiest team 🌧️ and the biggest drop is the luckiest 🍀, with PA breaking ties.
      </p>

      <div className="leaderboard-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th scope="col" className="rank">#</th>
              <th scope="col" className="actual-rank" title="Rank in the real standings">Real</th>
              <th scope="col" className="rank-change"><span className="visually-hidden">Change vs real standings</span></th>
              <th scope="col" className="team">Team</th>
              <th scope="col">W</th>
              <th scope="col">L</th>
              {hasTies && <th scope="col">T</th>}
              <th scope="col">PF</th>
              <th scope="col">PA</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const { user, record, rank, actualRank } = entry;
              const rankChange = getRankChange(entry);
              return (
                <tr
                  key={user.user_id}
                  className={user.user_id === selectedUserId ? 'selected' : ''}
                  onClick={() => onSelectUser(user.user_id)}
                >
                  <td className="rank">{rank}</td>
                  <td className="actual-rank">{actualRank}</td>
                  <td className="rank-change"><RankChange change={rankChange} /></td>
                  <th scope="row" className="team">
                    <div className="team-cell">
                      <span className="team-cell-name">{getTeamName(user)}</span>
                      {user.user_id === luckiest && <LuckBadge kind="luckiest" rankChange={rankChange} />}
                      {user.user_id === unluckiest && <LuckBadge kind="unluckiest" rankChange={rankChange} />}
                    </div>
                  </th>
                  <td>{record.wins}</td>
                  <td>{record.losses}</td>
                  {hasTies && <td>{record.ties}</td>}
                  <td>{record.pointsFor.toFixed(2)}</td>
                  <td>{record.pointsAgainst.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Up means the team ranks higher in all-play than in the real standings
function RankChange({ change }: { change: number }) {
  if (change === 0) {
    return <span className="rank-change-badge same" title="Same as the real standings">–</span>;
  }

  const direction = change > 0 ? 'up' : 'down';
  const spots = Math.abs(change);
  return (
    <span
      className={`rank-change-badge ${direction}`}
      title={`${spots} spot${spots > 1 ? 's' : ''} ${change > 0 ? 'higher' : 'lower'} than in the real standings`}
    >
      <span aria-hidden="true">{change > 0 ? '▲' : '▼'}</span>
      {spots}
    </span>
  );
}

import { ReactNode } from 'react';
import { UserId } from '../../data/data';
import { getLuckExtremes, getRankChange, LeaderboardEntry, ScheduleStrength } from '../../data/leaderboard';
import { BenchStats } from '../../data/lineup';
import { getTeamName } from '../../data/matchupAnalysis';
import { LuckBadge } from './LuckBadge';
import './Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  description: string;
  controls?: ReactNode;
  toolbar?: ReactNode;
  selectedUserId: UserId;
  onSelectUser: (userId: UserId) => void;
}

export function Leaderboard({ entries, description, controls, toolbar, selectedUserId, onSelectUser }: LeaderboardProps) {
  const hasTies = entries.some(e => e.record.ties > 0);
  const hasBench = entries.some(e => e.bench !== null);
  const { luckiest, unluckiest } = getLuckExtremes(entries);

  return (
    <section className="panel leaderboard">
      <div className="leaderboard-header">
        <h2 className="section-title">All-play leaderboard</h2>
        {controls}
      </div>
      <p className="leaderboard-description">{description}</p>
      <ul className="leaderboard-legend">
        <li><span className="legend-arrows"><span className="up">▲</span><span className="down">▼</span></span> real ranking difference</li>
        <li><span aria-hidden="true">🍀</span> Luckiest: biggest fraud</li>
        <li><span aria-hidden="true">🌧️</span> Unluckiest: biggest cope</li>
      </ul>

      {toolbar}

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
              <th scope="col" title="Strength of schedule: opponents' points per game vs. the league average">SOS</th>
              {hasBench && <th scope="col" title="Points left on the bench: best possible lineup minus points actually scored">Bench</th>}
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
                  <td><ScheduleStrengthValue strength={entry.scheduleStrength} /></td>
                  {hasBench && <td><BenchValue bench={entry.bench} /></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Harder schedules (opponents scored more than average) read as bad news, easier ones as good
function ScheduleStrengthValue({ strength }: { strength: ScheduleStrength }) {
  const { difference, opponentAverage, leagueAverage } = strength;
  const rounded = Number(difference.toFixed(1));
  const level = rounded > 0 ? 'harder' : rounded < 0 ? 'easier' : 'even';
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';

  return (
    <span
      className={`schedule-strength ${level}`}
      title={`Opponents averaged ${opponentAverage.toFixed(2)} pts per game (league average ${leagueAverage.toFixed(2)})`}
    >
      {sign}{Math.abs(rounded).toFixed(1)}
    </span>
  );
}

function BenchValue({ bench }: { bench: BenchStats | null }) {
  if (!bench) return <span className="bench-value unknown" title="Best lineup unavailable">–</span>;

  return (
    <span
      className="bench-value"
      title={`Best lineup: ${bench.bestPoints.toFixed(2)} pts · ${(bench.efficiency * 100).toFixed(1)}% efficiency`}
    >
      {bench.pointsLeft.toFixed(2)}
    </span>
  );
}

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

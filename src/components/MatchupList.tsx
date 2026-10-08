import { Matchup } from '../data/data';
import { getPlayedMatchups } from '../data/matchupAnalysis';
import { MatchupCard } from './MatchupCard';

interface MatchupListProps {
  matchups: Matchup[];
}

export function MatchupList({ matchups }: MatchupListProps) {
  const played = getPlayedMatchups(matchups);

  return (
    <section>
      <h2 className="section-title">Weekly matchups</h2>
      {played.length === 0 ? (
        <p className="empty-state">No games played yet this season.</p>
      ) : (
        <div className="matchup-list">
          {played.map(matchup => (
            <MatchupCard key={`${matchup.week}-${matchup.team.user.user_id}`} matchup={matchup} />
          ))}
        </div>
      )}
    </section>
  );
}

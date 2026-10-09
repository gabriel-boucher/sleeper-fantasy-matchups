import { CSSProperties, ReactNode } from 'react';
import { Matchup } from '../../data/data';
import { getPlayedMatchups } from '../../data/matchupAnalysis';
import { MatchupCard } from './MatchupCard';
import './MatchupList.css';

const COLUMNS = 2;

interface MatchupListProps {
  matchups: Matchup[];
  // The week being played; shown after the finished weeks
  liveMatchup?: Matchup | null;
  // Shown on the same line as the title, aligned right
  headerContent?: ReactNode;
}

export function MatchupList({ matchups, liveMatchup, headerContent }: MatchupListProps) {
  const played = getPlayedMatchups(matchups);
  const cardCount = played.length + (liveMatchup ? 1 : 0);
  // Weeks fill the first column top to bottom, then the second
  const style = { '--matchup-rows': Math.ceil(cardCount / COLUMNS) } as CSSProperties;

  return (
    <section className="matchup-section">
      <div className="matchup-section-header">
        <h3 className="section-title">Weekly matchups</h3>
        {headerContent}
      </div>
      {cardCount === 0 ? (
        <p className="empty-state">No games played yet this season.</p>
      ) : (
        <div className="matchup-list" style={style}>
          {played.map(matchup => (
            <MatchupCard key={`${matchup.week}-${matchup.team.user.user_id}`} matchup={matchup} />
          ))}
          {liveMatchup && <MatchupCard matchup={liveMatchup} isLive />}
        </div>
      )}
    </section>
  );
}

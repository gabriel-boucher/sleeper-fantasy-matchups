import { CSSProperties, ReactNode } from 'react';
import { getPlayedMatchups } from '../../domain/matchups';
import { Matchup } from '../../types/models';
import { Section } from '../common/Section';
import { MatchupCard } from './MatchupCard';
import './MatchupList.css';

const COLUMN_COUNT = 2;

interface MatchupListProps {
  matchups: Matchup[];
  liveMatchup?: Matchup | null;
  weeklyMedians?: Map<number, number>;
  headerContent?: ReactNode;
  onSelectMatchup: (matchup: Matchup) => void;
}

export function MatchupList({ matchups, liveMatchup, weeklyMedians, headerContent, onSelectMatchup }: MatchupListProps) {
  const playedMatchups = getPlayedMatchups(matchups);
  const cardCount = playedMatchups.length + (liveMatchup ? 1 : 0);
  const rowsFilledColumnByColumn = { '--matchup-rows': Math.ceil(cardCount / COLUMN_COUNT) } as CSSProperties;

  return (
    <Section title="Weekly matchups" actions={headerContent}>
      {cardCount === 0 ? (
        <p className="empty-state">No games played yet this season.</p>
      ) : (
        <div className="matchup-list" style={rowsFilledColumnByColumn}>
          {playedMatchups.map(matchup => (
            <MatchupCard
              key={`${matchup.week}-${matchup.team.user.id}`}
              matchup={matchup}
              median={weeklyMedians?.get(matchup.week)}
              onSelect={onSelectMatchup}
            />
          ))}
          {liveMatchup && (
            <MatchupCard matchup={liveMatchup} isLive median={weeklyMedians?.get(liveMatchup.week)} onSelect={onSelectMatchup} />
          )}
        </div>
      )}
    </Section>
  );
}

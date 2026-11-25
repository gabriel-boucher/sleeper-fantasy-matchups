import { useTeamSelectionContext } from '../../context/teamSelectionContext';
import { ConfirmedOutcome } from '../../domain/playoffClinching';
import { PlayoffOdds } from '../../domain/playoffOdds';
import { getTeamName } from '../../domain/teams';
import { ConfirmedOutcomeBadge } from './ConfirmedOutcomeBadge';
import { PlayoffOddsColumn } from './playoffOddsColumns';
import { SplitOddsBar } from './SplitOddsBar';

interface PlayoffOddsRowProps {
  odds: PlayoffOdds;
  position: number;
  columns: PlayoffOddsColumn[];
  confirmedOutcome: ConfirmedOutcome | null;
}

export function PlayoffOddsRow({ odds, position, columns, confirmedOutcome }: PlayoffOddsRowProps) {
  const { selectedUserId, selectTeam } = useTeamSelectionContext();
  const { user, mostLikelySeed } = odds;

  return (
    <tr className={user.id === selectedUserId ? 'selected' : ''} onClick={() => selectTeam?.(user.id)}>
      <td className="rank">{position}</td>
      <th scope="row" className="team">
        <div className="team-cell">
          <span className="team-cell-name">{getTeamName(user)}</span>
          {confirmedOutcome && <ConfirmedOutcomeBadge outcome={confirmedOutcome} />}
        </div>
      </th>
      {columns.map(({ good, bad }) => (
        <td key={good.label}>
          <SplitOddsBar goodLabel={good.label} goodChance={good.getChance(odds)} badLabel={bad.label} badChance={bad.getChance(odds)} />
        </td>
      ))}
      <td className="playoff-odds-seed">{mostLikelySeed}</td>
    </tr>
  );
}

import { ConfirmedOutcome } from '../../domain/playoffClinching';
import { PlayoffOdds } from '../../domain/playoffOdds';
import { UserId } from '../../types/models';
import { getColumnLabel, getShownColumns, LIKELY_SEED_HEADER } from './playoffOddsColumns';
import { PlayoffOddsRow } from './PlayoffOddsRow';
import './PlayoffOddsTable.css';

interface PlayoffOddsTableProps {
  odds: PlayoffOdds[];
  confirmedOutcomes: Map<UserId, ConfirmedOutcome> | null;
}

export function PlayoffOddsTable({ odds, confirmedOutcomes }: PlayoffOddsTableProps) {
  const columns = getShownColumns(odds);
  const headers = [...columns.map(column => ({ label: getColumnLabel(column), hint: column.hint })), LIKELY_SEED_HEADER];

  return (
    <div className="data-table-scroll">
      <table className="data-table playoff-odds-table">
        <thead>
          <tr>
            <th scope="col" className="rank">#</th>
            <th scope="col" className="team">Team</th>
            {headers.map(column => (
              <th key={column.label} scope="col" title={column.hint}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {odds.map((teamOdds, i) => (
            <PlayoffOddsRow
              key={teamOdds.user.id}
              odds={teamOdds}
              position={i + 1}
              columns={columns}
              confirmedOutcome={confirmedOutcomes?.get(teamOdds.user.id) ?? null}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

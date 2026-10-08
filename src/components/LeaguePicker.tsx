import { League } from '../data/data';
import { SelectField } from './SelectField';

interface LeaguePickerProps {
  leagues: League[];
  leagueId: string;
  seasonLeagueId: string;
  onLeagueChange: (leagueId: string) => void;
  onSeasonChange: (seasonLeagueId: string) => void;
}

export function LeaguePicker({ leagues, leagueId, seasonLeagueId, onLeagueChange, onSeasonChange }: LeaguePickerProps) {
  const selectedLeague = leagues.find(l => l.id === leagueId);

  return (
    <div className="panel field-row">
      <SelectField
        id="league-select"
        label="League"
        value={leagueId}
        options={leagues.map(l => ({ value: l.id, label: l.name }))}
        placeholder="Select a league"
        onChange={onLeagueChange}
      />
      <SelectField
        id="season-select"
        label="Season"
        value={seasonLeagueId}
        options={selectedLeague?.seasons.map(s => ({ value: s.league_id, label: s.season })) ?? []}
        placeholder={selectedLeague ? undefined : 'Select a league first'}
        disabled={!selectedLeague}
        onChange={onSeasonChange}
      />
    </div>
  );
}

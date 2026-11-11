import { League } from '../../data/data';
import { SelectField } from '../common/SelectField';
import { UserAvatar } from '../common/UserAvatar';
import './LeaguePicker.css';

interface LeaguePickerProps {
  // The searched Sleeper user, whose leagues these are
  displayName: string;
  // Their team in the selected season; missing until it loads, or if they weren't in that season
  teamName?: string;
  avatarUrl: string | null;
  leagues: League[];
  leagueId: string;
  seasonLeagueId: string;
  onLeagueChange: (leagueId: string) => void;
  onSeasonChange: (seasonLeagueId: string) => void;
}

// Whose leagues these are (and their team) on the left, the league and season to look at on the right
export function LeaguePicker({ displayName, teamName, avatarUrl, leagues, leagueId, seasonLeagueId, onLeagueChange, onSeasonChange }: LeaguePickerProps) {
  const selectedLeague = leagues.find(l => l.id === leagueId);

  return (
    <section className="panel league-picker" aria-label={`${displayName}'s leagues`}>
      <div className="league-picker-identity">
        <UserAvatar url={avatarUrl} name={teamName ?? displayName} />
        <div className="league-picker-names">
          <h2 className="league-picker-user">@{displayName}</h2>
          {teamName && <span className="league-picker-team">{teamName}</span>}
        </div>
      </div>
      <div className="field-row league-picker-fields">
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
    </section>
  );
}

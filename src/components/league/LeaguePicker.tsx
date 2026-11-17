import { League } from '../../types/models';
import { ListboxField } from '../common/ListboxField';
import { UserAvatar } from '../common/UserAvatar';
import './LeaguePicker.css';

interface LeaguePickerProps {
  displayName: string;
  teamName?: string;
  avatarUrl: string | null;
  leagues: League[];
  leagueId: string;
  seasonLeagueId: string;
  onLeagueChange: (leagueId: string) => void;
  onSeasonChange: (seasonLeagueId: string) => void;
}

export function LeaguePicker({ displayName, teamName, avatarUrl, leagues, leagueId, seasonLeagueId, onLeagueChange, onSeasonChange }: LeaguePickerProps) {
  const selectedLeague = leagues.find(league => league.id === leagueId);
  const leagueOptions = leagues.map(league => ({ value: league.id, label: league.name }));
  const seasonOptions = selectedLeague?.seasonsLatestFirst.map(s => ({ value: s.leagueId, label: s.season })) ?? [];

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
        <ListboxField
          id="league-select"
          label="League"
          value={leagueId}
          options={leagueOptions}
          promptWhenNothingChosen="Select a league"
          onChange={onLeagueChange}
        />
        <ListboxField
          id="season-select"
          label="Season"
          value={seasonLeagueId}
          options={seasonOptions}
          promptWhenNothingChosen="Select a league first"
          disabled={!selectedLeague}
          onChange={onSeasonChange}
        />
      </div>
    </section>
  );
}

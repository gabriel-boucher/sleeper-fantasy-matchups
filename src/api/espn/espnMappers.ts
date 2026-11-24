import { PlayerDirectory, PlayerId } from '../../types/models';
import { EspnGameSummaryDto, EspnScoreboardDto, EspnTeamPlayersDto } from './espnDto';
import { EspnGame, InjuredPlayer, PlayName } from './espnModels';
import { createPlayNameLookup, splitFullName } from './espnNames';
import { toEspnTeamCode } from './espnTeamCodes';

export const INJURY_PARSER_VERSION = 2;

const PLAY_INJURY_PATTERN = /\b([A-Z]{2,3})-([A-Z][A-Za-z]*\.(?:(?!\s[A-Z]{2,3}-)[A-Za-z'.\- ])+?) was injured during the play/g;

const RECAP_INJURY_SECTION_START = /<hl2>\s*Injur[^<]*<\/hl2>|\bINJUR(?:Y REPORT|IES)\b:?/;
const RECAP_INJURY_SECTION_END = /<hl2>|\bUP NEXT\b|---/;
const RECAP_PLAYER_LINK = /<a\s[^>]*\/player\/_\/id\/(\d+)[^>]*>[\s\S]*?<\/a>/gi;
const RECAP_PLAYER_MARKER = /\{\{(\d+)}}/g;
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z{])/;
const LEFT_GAME_PHRASES = /\b(left|exited|departed|went out|carted|helped off|limped off|walked off|went to the locker room|went down|did not return|didn't return|ruled out|hurt|injured|injuring|suffered|lost|concussion protocol)\b/i;
const DID_NOT_LEAVE_GAME_PHRASES = /\b(briefly|but returned|later returned|returned to the game|returned after|came back|re-?entered|inactive|missed|missing|sat out|did not play|didn't play|did not make the trip|didn't make the trip|(?:placed|put|moved) on injured reserve|played without|were without|was without|pregame|warmups|before kickoff|no injuries)\b/i;

export function toEspnGames(scoreboard: EspnScoreboardDto): EspnGame[] {
  return (scoreboard.events ?? []).map(event => ({ id: event.id, isFinal: event.status?.type?.completed ?? false }));
}

export function toInjuredPlayers(summary: EspnGameSummaryDto): InjuredPlayer[] {
  return [...toPlayByPlayInjuries(summary), ...toRecapInjuries(summary.article?.story ?? '')];
}

export function toSleeperIdsOutForGame(injuredPlayers: InjuredPlayer[], players: PlayerDirectory | null): PlayerId[] {
  const directory = [...players ?? []];
  const sleeperIdsByEspnId = new Map(directory.flatMap(([id, player]) => (player.espnId ? [[player.espnId, id] as const] : [])));
  const findByPlayName = createPlayNameLookup(directory.flatMap(([id, player]) =>
    player.nflTeam ? [{ team: toEspnTeamCode(player.nflTeam), ...splitFullName(player.name), value: id }] : []
  ));
  const toSleeperId = ({ espnId, playName }: InjuredPlayer) =>
    (espnId ? sleeperIdsByEspnId.get(espnId) : undefined) ?? (playName ? findByPlayName(playName) : null);

  return [...new Set(injuredPlayers.filter(player => !player.returned).flatMap(player => toSleeperId(player) ?? []))];
}

function toPlayByPlayInjuries(summary: EspnGameSummaryDto): InjuredPlayer[] {
  const findEspnId = createPlayNameLookup(toBoxScorePlayers(summary.boxscore?.players ?? []));
  const playTexts = (summary.drives?.previous ?? []).flatMap(drive => drive.plays ?? []).map(play => play.text ?? '');

  return playTexts.flatMap((text, playIndex) =>
    [...text.matchAll(PLAY_INJURY_PATTERN)].map(([, teamCode, shortName]) => {
      const playName: PlayName = { team: toEspnTeamCode(teamCode), shortName };
      return {
        espnId: findEspnId(playName),
        playName,
        returned: playTexts.slice(playIndex + 1).some(laterText => mentions(laterText, shortName))
      };
    })
  );
}

function toRecapInjuries(story: string): InjuredPlayer[] {
  return getRecapInjurySentences(story)
    .filter(sentence => LEFT_GAME_PHRASES.test(sentence) && !DID_NOT_LEAVE_GAME_PHRASES.test(sentence))
    .flatMap(sentence => [...sentence.matchAll(RECAP_PLAYER_MARKER)].map(([, espnId]) => ({ espnId, playName: null, returned: false })));
}

function getRecapInjurySentences(story: string): string[] {
  const start = story.match(RECAP_INJURY_SECTION_START);
  if (!start || start.index === undefined) return [];

  const afterStart = story.slice(start.index + start[0].length);
  const endIndex = afterStart.search(RECAP_INJURY_SECTION_END);
  const section = endIndex === -1 ? afterStart : afterStart.slice(0, endIndex);

  return section
    .replace(RECAP_PLAYER_LINK, ' {{$1}} ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .split(SENTENCE_BREAK);
}

function toBoxScorePlayers(teams: EspnTeamPlayersDto[]) {
  return teams.flatMap(({ team, statistics }) =>
    (statistics ?? []).flatMap(group => group.athletes ?? []).flatMap(({ athlete }) =>
      athlete.firstName && athlete.lastName
        ? [{ team: team.abbreviation, firstName: athlete.firstName, lastName: athlete.lastName, value: athlete.id }]
        : []
    )
  );
}

function mentions(text: string, shortName: string): boolean {
  const escapedName = shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z.])${escapedName}(?![A-Za-z])`).test(text);
}

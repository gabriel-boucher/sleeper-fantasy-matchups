import { PlayerDirectory, PlayerId, PlayerInfo } from '../../types/models';
import { EspnIdsBySleeperId } from '../playerIds/playerIdsMappers';
import { PlayerDto } from '../sleeper/sleeperDto';
import { PublishedPlayers } from './publishedDataDto';

export function toPublishedPlayers(playerDtos: Record<PlayerId, PlayerDto>, espnIdsBySleeperId: EspnIdsBySleeperId): PublishedPlayers {
  const players: PublishedPlayers = {};
  Object.entries(playerDtos).forEach(([id, player]) => {
    if (!player.fantasy_positions?.length) return;
    const espnId = espnIdsBySleeperId[id] ?? (player.espn_id ? String(player.espn_id) : null);
    players[id] = [getPlayerName(player, id), player.fantasy_positions, player.team ?? null, espnId];
  });
  return players;
}

export function toPlayerDirectory(players: PublishedPlayers): PlayerDirectory {
  return new Map(Object.entries(players).map(([id, [name, positions, nflTeam, espnId]]): [PlayerId, PlayerInfo] =>
    [id, { name, positions, nflTeam, espnId }]
  ));
}

function getPlayerName(player: PlayerDto, id: PlayerId): string {
  const firstAndLastName = [player.first_name, player.last_name].filter(Boolean).join(' ');
  return player.full_name || firstAndLastName || id;
}

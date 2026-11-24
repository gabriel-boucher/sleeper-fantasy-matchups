export interface EspnGame {
  id: string;
  isFinal: boolean;
}

export interface PlayName {
  team: string;
  shortName: string;
}

export interface InjuredPlayer {
  espnId: string | null;
  playName: PlayName | null;
  returned: boolean;
}

export interface EspnWeekInjuries {
  injuredPlayers: InjuredPlayer[];
  isComplete: boolean;
}

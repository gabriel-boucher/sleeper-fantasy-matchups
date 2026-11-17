export type UserId = string;
export type RosterId = number;
export type MatchupId = number;
export type PlayerId = string;

export interface User {
  id: UserId;
  displayName: string;
  teamName?: string;
  avatarUrl: string | null;
  isOrphan?: boolean;
}

export type PlayerPoints = Record<PlayerId, number>;
export type PlayerProjections = Record<PlayerId, number>;
export type WeeklyProjections = Map<number, PlayerProjections>;

export interface TeamRoster {
  starters: PlayerId[];
  players: PlayerId[];
  playerPoints: PlayerPoints;
  playerProjections: PlayerProjections | null;
}

export interface Team {
  user: User;
  points: number;
  bestPoints: number | null;
  roster: TeamRoster | null;
  projectedPoints: number | null;
}

export interface Matchup {
  week: number;
  team: Team;
  opponent: Team;
}

export interface LeagueSeason {
  season: string;
  leagueId: string;
}

export interface League {
  id: string;
  name: string;
  seasonsLatestFirst: LeagueSeason[];
}

export interface UserLeagues {
  userId: UserId;
  displayName: string;
  avatarUrl: string | null;
  leagues: League[];
}

export interface TeamRecord {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface PlayerInfo {
  name: string;
  positions: string[];
  nflTeam: string | null;
}

export type PlayerDirectory = Map<PlayerId, PlayerInfo>;

export type EligiblePositions = string[];

export interface BestLineupContext {
  startingSlots: EligiblePositions[];
  players: PlayerDirectory;
}

export interface ProjectionSettings {
  season: string;
  pointsPerStat: Record<string, number>;
  startingPositions: string[];
}

export interface Season {
  leagueId: string;
  teamUsers: User[];
  completedMatchups: Matchup[];
  lastRegularSeasonWeek: number;
  hasMedianGame: boolean;
  officialStandings: Map<UserId, TeamRecord>;
  liveWeek: number | null;
  liveMatchups: Matchup[];
  rosterOwners: Map<RosterId, User>;
  bestLineupContext: BestLineupContext | null;
  startingSlotNames: string[];
  players: PlayerDirectory | null;
  isCurrentSeason: boolean;
  projectionSettings: ProjectionSettings | null;
}

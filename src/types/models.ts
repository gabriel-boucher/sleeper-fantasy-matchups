export type UserId = string;
export type RosterId = number;
export type MatchupId = number;
export type PlayerId = string;

export interface User {
  id: UserId;
  managerId: UserId | null;
  displayName: string;
  teamName?: string;
  avatarUrl: string | null;
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
  isFinal: boolean;
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
  espnId: string | null;
}

export type PlayerDirectory = Map<PlayerId, PlayerInfo>;

export type EligiblePositions = string[];

export type StartingSlot = EligiblePositions | null;

export interface BestLineupContext {
  startingSlots: StartingSlot[];
  players: PlayerDirectory;
}

export type WeeklyPoints = Map<number, Map<UserId, number>>;

export type WeeklyInjuries = Map<number, ReadonlySet<PlayerId>>;

export type PlayoffRoundType = 'one-week' | 'two-week-final' | 'two-week';

export type BracketSource =
  | { kind: 'seed'; rosterId: RosterId }
  | { kind: 'winner' | 'loser'; matchId: number };

export interface BracketMatchSpec {
  id: number;
  round: number;
  place: number | null;
  sources: [BracketSource | null, BracketSource | null];
  recordedWinner: RosterId | null;
}

export interface Brackets {
  winners: BracketMatchSpec[];
  losers: BracketMatchSpec[];
}

export interface LeagueRules {
  startWeek: number;
  regularSeasonEnd: number | null;
  playoffRoundType: PlayoffRoundType;
  playoffTeamCount: number | null;
  isBestBall: boolean;
  hasMedianGame: boolean;
}

export interface ProjectionSettings {
  season: string;
  pointsPerStat: Record<string, number>;
  startingPositions: string[];
}

export interface Season {
  leagueId: string;
  nflSeason: string;
  teamUsers: User[];
  teamIdsByManagerId: Map<UserId, UserId>;
  completedMatchups: Matchup[];
  completedWeeklyPoints: WeeklyPoints;
  lastRegularSeasonWeek: number;
  playoffRoundType: PlayoffRoundType;
  playoffTeamCount: number | null;
  hasMedianGame: boolean;
  hasHeadToHead: boolean;
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

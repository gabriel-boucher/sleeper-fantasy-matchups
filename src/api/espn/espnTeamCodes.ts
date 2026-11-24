const ESPN_TEAM_CODES: Record<string, string> = {
  WAS: 'WSH',
  CLV: 'CLE',
  HST: 'HOU',
  LA: 'LAR',
  ARZ: 'ARI',
  BLT: 'BAL'
};

export function toEspnTeamCode(teamCode: string): string {
  return ESPN_TEAM_CODES[teamCode] ?? teamCode;
}

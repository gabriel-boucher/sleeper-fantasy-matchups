export interface ScoringSettingDefinition {
  key: string;
  label: string;
}

export interface ScoringSettingGroup {
  id: string;
  title: string;
  settings: ScoringSettingDefinition[];
}

export const SCORING_SETTING_GROUPS: ScoringSettingGroup[] = [
  {
    id: 'receiving',
    title: 'Receiving',
    settings: [
      { key: 'rec', label: 'Reception (PPR)' },
      { key: 'bonus_rec_rb', label: 'RB reception bonus' },
      { key: 'bonus_rec_wr', label: 'WR reception bonus' },
      { key: 'bonus_rec_te', label: 'TE reception bonus (TE premium)' },
      { key: 'rec_yd', label: 'Receiving yards' },
      { key: 'rec_td', label: 'Receiving TD' },
      { key: 'rec_2pt', label: '2-pt conversion' },
      { key: 'bonus_rec_yd_100', label: '100+ yard game bonus' },
      { key: 'bonus_rec_yd_200', label: '200+ yard game bonus' }
    ]
  },
  {
    id: 'rushing',
    title: 'Rushing',
    settings: [
      { key: 'rush_yd', label: 'Rushing yards' },
      { key: 'rush_td', label: 'Rushing TD' },
      { key: 'rush_2pt', label: '2-pt conversion' },
      { key: 'rush_att', label: 'Rush attempt' },
      { key: 'bonus_rush_yd_100', label: '100+ yard game bonus' },
      { key: 'bonus_rush_yd_200', label: '200+ yard game bonus' }
    ]
  },
  {
    id: 'passing',
    title: 'Passing',
    settings: [
      { key: 'pass_yd', label: 'Passing yards' },
      { key: 'pass_td', label: 'Passing TD' },
      { key: 'pass_int', label: 'Interception thrown' },
      { key: 'pass_2pt', label: '2-pt conversion' },
      { key: 'pass_cmp', label: 'Completion' },
      { key: 'pass_inc', label: 'Incompletion' },
      { key: 'pass_sack', label: 'Sacked' },
      { key: 'bonus_pass_yd_300', label: '300+ yard game bonus' },
      { key: 'bonus_pass_yd_400', label: '400+ yard game bonus' }
    ]
  },
  {
    id: 'kicking',
    title: 'Kicking',
    settings: [
      { key: 'fgm_0_19', label: 'FG made 0-19' },
      { key: 'fgm_20_29', label: 'FG made 20-29' },
      { key: 'fgm_30_39', label: 'FG made 30-39' },
      { key: 'fgm_40_49', label: 'FG made 40-49' },
      { key: 'fgm_50p', label: 'FG made 50+' },
      { key: 'fgm_yds', label: 'FG yards (per yard)' },
      { key: 'fgmiss', label: 'FG missed' },
      { key: 'xpm', label: 'PAT made' },
      { key: 'xpmiss', label: 'PAT missed' }
    ]
  },
  {
    id: 'defense',
    title: 'Defense',
    settings: [
      { key: 'def_td', label: 'Defensive TD' },
      { key: 'def_st_td', label: 'Special teams TD' },
      { key: 'sack', label: 'Sack' },
      { key: 'int', label: 'Interception' },
      { key: 'fum_rec', label: 'Fumble recovery' },
      { key: 'ff', label: 'Forced fumble' },
      { key: 'safe', label: 'Safety' },
      { key: 'blk_kick', label: 'Blocked kick' },
      { key: 'def_st_ff', label: 'Special teams forced fumble' },
      { key: 'def_st_fum_rec', label: 'Special teams fumble recovery' },
      { key: 'pts_allow', label: 'Per point allowed' },
      { key: 'pts_allow_0', label: '0 points allowed' },
      { key: 'pts_allow_1_6', label: '1-6 points allowed' },
      { key: 'pts_allow_7_13', label: '7-13 points allowed' },
      { key: 'pts_allow_14_20', label: '14-20 points allowed' },
      { key: 'pts_allow_21_27', label: '21-27 points allowed' },
      { key: 'pts_allow_28_34', label: '28-34 points allowed' },
      { key: 'pts_allow_35p', label: '35+ points allowed' }
    ]
  },
  {
    id: 'misc',
    title: 'Offense',
    settings: [
      { key: 'fum_lost', label: 'Fumble lost' },
      { key: 'fum', label: 'Fumble' },
      { key: 'fum_rec_td', label: 'Fumble recovery TD' },
      { key: 'st_td', label: 'Special teams TD (player)' },
      { key: 'st_ff', label: 'Special teams forced fumble (player)' },
      { key: 'st_fum_rec', label: 'Special teams fumble recovery (player)' }
    ]
  }
];

export const CURATED_SCORING_KEYS: ReadonlySet<string> = new Set(
  SCORING_SETTING_GROUPS.flatMap(group => group.settings.map(setting => setting.key))
);

export const ADVANCED_SECTION_TITLE = 'Advanced';
export const OTHER_GROUP_TITLE = 'Other';
export const IDP_GROUP_ID = 'advanced-idp';
export const ADVANCED_DEFENSE_GROUP_ID = 'advanced-defense';
export const IDP_KEY_PREFIX = 'idp_';

export const ADVANCED_SETTING_GROUPS: ScoringSettingGroup[] = [
  {
    id: 'advanced-receiving',
    title: 'Receiving',
    settings: [
      { key: 'rec_fd', label: 'Receiving first down' },
      { key: 'bonus_fd_wr', label: 'WR first down bonus' },
      { key: 'bonus_fd_te', label: 'TE first down bonus' },
      { key: 'rec_0_4', label: 'Reception of 0-4 yards' },
      { key: 'rec_5_9', label: 'Reception of 5-9 yards' },
      { key: 'rec_10_19', label: 'Reception of 10-19 yards' },
      { key: 'rec_20_29', label: 'Reception of 20-29 yards' },
      { key: 'rec_30_39', label: 'Reception of 30-39 yards' },
      { key: 'rec_40p', label: 'Reception of 40+ yards' },
      { key: 'rec_td_40p', label: '40+ yard receiving TD bonus' },
      { key: 'rec_td_50p', label: '50+ yard receiving TD bonus' },
      { key: 'bonus_rush_rec_yd_100', label: '100+ rush + rec yards bonus' },
      { key: 'bonus_rush_rec_yd_200', label: '200+ rush + rec yards bonus' }
    ]
  },
  {
    id: 'advanced-rushing',
    title: 'Rushing',
    settings: [
      { key: 'rush_fd', label: 'Rushing first down' },
      { key: 'bonus_fd_rb', label: 'RB first down bonus' },
      { key: 'rush_40p', label: '40+ yard rush' },
      { key: 'rush_td_40p', label: '40+ yard rushing TD bonus' },
      { key: 'rush_td_50p', label: '50+ yard rushing TD bonus' },
      { key: 'bonus_rush_att_20', label: '20+ rush attempts bonus' },
      { key: 'bonus_rush_td_qb', label: 'QB rushing TD bonus' }
    ]
  },
  {
    id: 'advanced-passing',
    title: 'Passing',
    settings: [
      { key: 'pass_att', label: 'Pass attempt' },
      { key: 'pass_fd', label: 'Passing first down' },
      { key: 'bonus_fd_qb', label: 'QB first down bonus' },
      { key: 'pass_cmp_40p', label: '40+ yard completion' },
      { key: 'pass_td_40p', label: '40+ yard passing TD bonus' },
      { key: 'pass_td_50p', label: '50+ yard passing TD bonus' },
      { key: 'pass_int_td', label: 'Pick-six thrown' },
      { key: 'bonus_pass_cmp_25', label: '25+ completions bonus' }
    ]
  },
  {
    id: 'advanced-kicking',
    title: 'Kicking',
    settings: [
      { key: 'fgm', label: 'FG made (any distance)' },
      { key: 'fgm_50_59', label: 'FG made 50-59' },
      { key: 'fgm_60p', label: 'FG made 60+' },
      { key: 'fgm_yds_over_30', label: 'FG yards over 30 (per yard)' },
      { key: 'fgmiss_0_19', label: 'FG missed 0-19' },
      { key: 'fgmiss_20_29', label: 'FG missed 20-29' },
      { key: 'fgmiss_30_39', label: 'FG missed 30-39' },
      { key: 'fgmiss_40_49', label: 'FG missed 40-49' },
      { key: 'fgmiss_50_59', label: 'FG missed 50-59' },
      { key: 'fgmiss_50p', label: 'FG missed 50+' },
      { key: 'fgmiss_60p', label: 'FG missed 60+' }
    ]
  },
  {
    id: ADVANCED_DEFENSE_GROUP_ID,
    title: 'Defense',
    settings: [
      { key: 'def_3_and_out', label: 'Three-and-out forced' },
      { key: 'def_4_and_stop', label: 'Fourth-down stop' },
      { key: 'def_forced_punts', label: 'Forced punt' },
      { key: 'def_pass_def', label: 'Pass defended' },
      { key: 'def_2pt', label: 'Defensive 2-pt return' },
      { key: 'qb_hit', label: 'QB hit' },
      { key: 'sack_yd', label: 'Sack yards' },
      { key: 'tkl', label: 'Tackle' },
      { key: 'tkl_solo', label: 'Solo tackle' },
      { key: 'tkl_ast', label: 'Assisted tackle' },
      { key: 'tkl_loss', label: 'Tackle for loss' },
      { key: 'int_ret_yd', label: 'Interception return yards' },
      { key: 'fum_ret_yd', label: 'Fumble return yards' },
      { key: 'blk_kick_ret_yd', label: 'Blocked kick return yards' },
      { key: 'fg_ret_yd', label: 'Missed FG return yards' },
      { key: 'bonus_def_int_td_50p', label: '50+ yard pick-six bonus' },
      { key: 'bonus_def_fum_td_50p', label: '50+ yard fumble return TD bonus' },
      { key: 'def_st_tkl_solo', label: 'Special teams solo tackle' },
      { key: 'def_kr_yd', label: 'Team kick return yards' },
      { key: 'def_pr_yd', label: 'Team punt return yards' },
      { key: 'yds_allow', label: 'Per yard allowed' },
      { key: 'yds_allow_0_100', label: '0-99 yards allowed' },
      { key: 'yds_allow_100_199', label: '100-199 yards allowed' },
      { key: 'yds_allow_200_299', label: '200-299 yards allowed' },
      { key: 'yds_allow_300_349', label: '300-349 yards allowed' },
      { key: 'yds_allow_350_399', label: '350-399 yards allowed' },
      { key: 'yds_allow_400_449', label: '400-449 yards allowed' },
      { key: 'yds_allow_450_499', label: '450-499 yards allowed' },
      { key: 'yds_allow_500_549', label: '500-549 yards allowed' },
      { key: 'yds_allow_550p', label: '550+ yards allowed' }
    ]
  },
  {
    id: 'advanced-offense',
    title: 'Offense',
    settings: [
      { key: 'kr_yd', label: 'Kick return yards (player)' },
      { key: 'pr_yd', label: 'Punt return yards (player)' },
      { key: 'st_tkl_solo', label: 'Special teams solo tackle (player)' }
    ]
  },
  {
    id: IDP_GROUP_ID,
    title: 'Individual defenders (IDP)',
    settings: [
      { key: 'idp_tkl', label: 'Tackle' },
      { key: 'idp_tkl_solo', label: 'Solo tackle' },
      { key: 'idp_tkl_ast', label: 'Assisted tackle' },
      { key: 'idp_tkl_loss', label: 'Tackle for loss' },
      { key: 'idp_sack', label: 'Sack' },
      { key: 'idp_qb_hit', label: 'QB hit' },
      { key: 'idp_int', label: 'Interception' },
      { key: 'idp_pass_def', label: 'Pass defended' },
      { key: 'idp_ff', label: 'Forced fumble' },
      { key: 'idp_fum_rec', label: 'Fumble recovery' },
      { key: 'idp_def_td', label: 'Defensive TD' },
      { key: 'idp_safe', label: 'Safety' },
      { key: 'idp_blk_kick', label: 'Blocked kick' },
      { key: 'idp_int_ret_yd', label: 'Interception return yards' },
      { key: 'idp_fum_ret_yd', label: 'Fumble return yards' },
      { key: 'idp_sack_yd', label: 'Sack yards' },
      { key: 'idp_pass_def_3p', label: '3+ passes defended bonus' },
      { key: 'bonus_sack_2p', label: '2+ sacks bonus' },
      { key: 'bonus_tkl_10p', label: '10+ tackles bonus' }
    ]
  }
];

# Sleeper Fantasy Cope Machine

A web app for digging into [Sleeper](https://sleeper.com) fantasy football leagues. Enter any Sleeper username, pick one of their leagues and a season, and see how each team really did, how lucky it was, and how it would have fared with someone else's schedule.

No account or API key needed. Everything comes from Sleeper's public API.

## Features

### Season record
- **Current, best and worst record.** The team's real record next to the best and worst it would have had against every other team's schedule. Click a tile to view those matchups.
- **Against another schedule.** Replay the team's weekly scores against any other team's opponents.
- **Weekly matchups.** Every game with scores and W/L, filling the first column top to bottom, then the second. The week in progress appears as a **Live** card that refreshes every minute and never counts in any stats.

### All-play leaderboard
Ranks every team as if it had played every other team every week, in two views:
- **Season.** The whole regular season.
- **Week by week.** One week at a time, with arrows to step between weeks.

Columns:

| Column | Meaning |
|---|---|
| **#** | All-play rank (wins, then points for) |
| **Real** | Rank in the real standings |
| **▲ / ▼** | How many spots higher or lower the team ranks in all-play than in reality |
| **W / L** | All-play wins and losses |
| **PF / PA** | Actual points for and against |
| **SOS** | Strength of schedule: opponents' points per game minus the league average. Positive (red) = harder schedule |
| **Bench** | Points left on the bench: best possible lineup minus points actually scored. Hover for manager efficiency |

The biggest climb from real rank to all-play rank gets 🌧️ (unluckiest), and the biggest drop gets 🍀 (luckiest).

### All-play chart
A chart under the leaderboard that follows whichever column the leaderboard is sorted by: all-play wins per week for **W<sub>T</sub>**, wins per week for **W**, points for per week for **PF**, and so on. It shows the selected team, its opponent each week, and the league average and median. Hover or use the arrow keys to read each week.

### Shareable links
The current view is kept in the URL, so a link reopens exactly the same page:

```
?user=<username>&league=<league id>&season=<year>&team=<user id>&vs=<user id>&week=<week>
```

| Param | What it selects |
|---|---|
| `user` | Sleeper username to search |
| `league` | League (its most recent season's id) |
| `season` | Season year |
| `team` | Team shown in the season record |
| `vs` | Whose schedule the team is played against |
| `week` | Week shown in the leaderboard's week-by-week view |

Values that don't exist (an old league, a team not in that season) are ignored, and the app uses its defaults instead.

## How the numbers are calculated

- **Finished weeks only.** A week counts once Sleeper moves on to the next week. The current week only appears in the live card.
- **Regular season only** for the leaderboard, based on the league's playoff start week. The season record and matchups include playoff games.
- **Real standings** use Sleeper's official records, so leagues that give a win for beating the weekly median are ranked correctly.
- **All-play.** Each week, a team's score is compared with every other team's score that week.
- **Best lineup.** Fills the league's lineup slots (QB, RB, WR, TE, FLEX, SUPER_FLEX, K, DEF, IDP) from the whole roster, strictest slots first, each with the best eligible player left. Player positions come from Sleeper's player list (about 2.5 MB), which is downloaded at most once a day and cached in the browser.
- **League history.** Sleeper creates a new league id each season. The app follows each league's link to its previous season, so all of a league's seasons appear under one name, including seasons the searched user wasn't in.

## Getting started

Requires [Node.js](https://nodejs.org) 20.19+ or 22.12+ (for Vite 8).

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

| Script | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Type-checks and builds to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |
| `npm run publish-data -- <dir>` | Writes the published player list and injury files to `<dir>` (default `data-out`). Add `--injuries-only` to keep the existing player list, or `--until-done` to keep going past the 50-week batch limit |
| `npm run download-data` | Writes every season to `data-out`, batch after batch, until nothing is missing |

The build is fully static, so `dist/` can be hosted anywhere: Vercel, Netlify, GitHub Pages and so on.

## Published data
A GitHub Action (`.github/workflows/publish-data.yml`) runs `scripts/publishData.ts` and force-pushes the result as a single commit to the `data` branch:

- every day at 10:17 UTC, refreshing players and injuries;
- every 30 minutes during NFL game windows from September to January (Thursday, Sunday and Monday nights, Sunday afternoons, Thanksgiving afternoons and late-season Saturdays), refreshing injuries only with `--injuries-only`;
- on demand from the Actions tab.

Week files whose injuries did not change are not rewritten, and the push is skipped when no file changed.

| File | Contents |
|---|---|
| `players.json` | Every Sleeper player with fantasy positions: name, positions, NFL team and ESPN id |
| `injuries/{season}/week-{n}.json` | Sleeper ids of players who left a game injured that week, from ESPN play-by-play and game recaps, for every season since 2017. `complete` is true once every game is final |

Each run downloads at most 50 weeks from ESPN to stay under its rate limit: the current season first, then past seasons from newest to oldest. A first run on an empty branch therefore needs about four daily runs to fill every season. Weeks that are complete with the current `INJURY_PARSER_VERSION` are skipped; bumping that version regenerates every week over the following runs.

The app reads these files from `raw.githubusercontent.com` (override with `VITE_DATA_URL`). When a file is missing, older than three days (players) or not complete (injuries), it falls back to calling Sleeper, the DynastyProcess id table and ESPN directly.

> **Windows tip:** if the dev server stops picking up file changes, restart it, or turn on polling in `vite.config.ts` with `server: { watch: { usePolling: true } }`.

## Project structure

```
src/
  components/      React components, grouped by feature, each with its own CSS
    common/        Shared controls (panel, section, select, segmented toggle, step navigator, status messages)
    search/        Username form
    league/        League and season pickers
    season/        Season view and team / schedule filters
    record/        Season record card and record tiles
    matchups/      Weekly matchup cards and list
    lineup/        Head-to-head lineup dialog and player avatars
    leaderboard/   All-play leaderboard, column picker, sortable headers, luck badges, weekly trend chart
    playoffs/      Playoff and toilet bowl brackets
    home/          Home page
  api/             One folder per external source, each with its HTTP calls (*Api), response types (*Dto) and mappers (*Mappers)
    sleeper/       Sleeper leagues, players, projections and images
    espn/          ESPN games, play-by-play and recaps, and injury parsing
    playerIds/     DynastyProcess table linking ESPN and Sleeper player ids
    publishedData/ Files published to the data branch by the GitHub Action
  types/           Models shared across the app
  domain/          Pure fantasy logic with no React or network
  services/        Loading and caching of leagues, seasons, brackets, players, projections and injuries
  context/         React context for team and user links
  hooks/           React hooks (async loading, live refresh, playoff brackets, URL sync, stored preferences)
  constants/       Shared constants (weeks, playoff places, cache duration, chart series, leaderboard column groups)
  utils/           Generic helpers (math, collections, formatting, expiring cache, storage, URL parameters)
  styles/          Global design tokens (variables.css), reset and shared building blocks
scripts/           Node scripts run by the GitHub Action (publishData.ts and its lib/ modules)
```

Most stats live in `src/domain/` as plain functions:

| File | Responsibility |
|---|---|
| `records.ts` | Win/loss records: adding games, win percentage, formatting |
| `matchups.ts` | Results, played matchups, weekly medians and median record |
| `schedules.ts` | Schedule swaps, best/worst schedule |
| `leaderboard.ts` | All-play ranking, real rank, luck, strength of schedule |
| `leaderboardSort.ts` | Leaderboard sort orders and tie-breaks |
| `projections.ts` | Projected points for lineups and matchups |
| `lineup.ts` | Lineup slots, best possible lineup, bench points |
| `weeklyMetrics.ts` | Weekly value of the sorted leaderboard stat vs opponent, league average and median |
| `weeklyPoints.ts` | Points per team per week, including live scores |
| `playoffs.ts` | Playoff bracket results, byes and final standings |
| `bracketSeeding.ts` | Bracket seeds and standings order |
| `bracketLayout.ts` | Grid rows of each bracket match and bye |
| `projectedBracket.ts` | Bracket built from the current standings before the playoffs start |
| `seasonProgress.ts` | Which weeks are finished and which one is live |
| `injuries.ts` | Starters who left their game injured |

### Styling
All colors, font sizes, spacing (`--space-*`, a 4px scale), radii and chart colors are CSS variables in `src/styles/variables.css`, with dark mode values that follow the system setting. Change the look from there.

## Built with
- [React 19](https://react.dev) and TypeScript
- [Vite 8](https://vite.dev)
- [Sleeper API](https://docs.sleeper.com) (public, read-only)
- ESPN's public site API (undocumented) for play-by-play and game recaps
- [DynastyProcess player ids](https://github.com/dynastyprocess/data) to link ESPN and Sleeper players

This project isn't affiliated with Sleeper.

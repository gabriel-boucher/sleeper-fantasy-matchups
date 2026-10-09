# Sleeper Fantasy Matchups

A web app for digging into [Sleeper](https://sleeper.com) fantasy football leagues. Enter any Sleeper username, pick one of their leagues and a season, and see how each team really did, how lucky it was, and how it would have fared with someone else's schedule.

No account or API key needed. Everything comes from Sleeper's public API.

## Features

### Season record
- **Current, best and worst record.** The team's real record next to the best and worst it would have had against every other team's schedule. Click a tile to view those matchups.
- **Against another schedule.** Replay the team's weekly scores against any other team's opponents.
- **Weekly matchups.** Every game with scores and W/L, filling the first column top to bottom, then the second. The week in progress appears as a **Live** card that refreshes every minute and never counts in any stats.
- **Weekly points chart.** The team's score each week against the league average and median. Hover or use the arrow keys to read each week.

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

The build is fully static, so `dist/` can be hosted anywhere: Vercel, Netlify, GitHub Pages and so on.

> **Windows tip:** if the dev server stops picking up file changes, restart it, or turn on polling in `vite.config.ts` with `server: { watch: { usePolling: true } }`.

## Project structure

```
src/
  components/      React components, grouped by feature, each with its own CSS
    common/        Shared controls (select, segmented toggle, status messages)
    search/        Username form
    league/        League and season pickers
    season/        Season view and team / schedule filters
    record/        Season record card, record tiles, weekly points chart
    matchups/      Weekly matchup cards and list
    leaderboard/   All-play leaderboard, week navigator, luck badges
  data/            Pure logic with no React or network: models, mappers, stats
  services/        Sleeper API calls and loading of leagues, seasons and players
  hooks/           Reusable React hooks (async loading, live refresh, element width)
  styles/          Global design tokens (variables.css), reset and shared building blocks
  utils/           URL parameter helpers
```

Most stats live in `src/data/` as plain functions:

| File | Responsibility |
|---|---|
| `matchupAnalysis.ts` | Records, results, schedule swaps, best/worst schedule |
| `leaderboard.ts` | All-play ranking, real rank, luck, strength of schedule |
| `lineup.ts` | Lineup slots, best possible lineup, bench points |
| `weeklyScores.ts` | Weekly team score vs league average and median |
| `seasonProgress.ts` | Which weeks are finished and which one is live |

### Styling
All colors, font sizes, spacing (`--space-*`, a 4px scale), radii and chart colors are CSS variables in `src/styles/variables.css`, with dark mode values that follow the system setting. Change the look from there.

## Built with
- [React 19](https://react.dev) and TypeScript
- [Vite 8](https://vite.dev)
- [Sleeper API](https://docs.sleeper.com) (public, read-only)

This project isn't affiliated with Sleeper.

---
name: react-clean-code
description: The user's coding standards for React + TypeScript work in this repo - folder architecture, component extraction, contexts instead of prop drilling, deduplication, SOLID, and comment-free self-explanatory code. Use this whenever writing, refactoring, reviewing or cleaning up code in this project, and especially when the user says things like "clean the code", "refactor", "tidy up the new changes", "remove duplicates", "make components", "fix the architecture", or asks for a new feature, component, hook or service. Apply it even when the user does not name it - any new code here should already follow these rules.
---

# React clean code

These are the user's standing expectations for code in this project. New code should follow them from the start, and a "clean up" request means bringing existing code in line with them without changing behaviour.

## The rules

1. **No comments.** Code must explain itself through names: functions, variables, constants, types and small extracted helpers. If a line needs a comment, rename or extract until it doesn't. This includes config files (`vite.config.ts`, `tsconfig*.json`). Do not add comments to code you write.
2. **No duplicate functions.** Before writing a helper, search for an existing one (`domain/`, `utils/`, `hooks/`). When two functions repeat the same logic, extract the shared part into one helper and have both call it. Typical spots: rounding, "map each team once" loops, record/standing calculations, weekly cache loading, DTO-to-model mapping per week.
3. **Similar functions get a similar structure.** If two services or functions do the same kind of job (for example loading projections and loading stats), they should read the same way: same helper calls, same ordering, same return shapes. A reader who understands one should instantly understand the other.
4. **Code lives where it belongs.** Move code that sits in the wrong layer, or create a new file with a clear name (see the architecture below). Constants files hold data, not logic. Components hold rendering, not domain rules. A file that mixes two concerns gets split.
5. **Make components instead of repeating JSX.** When the same markup appears twice (rows, fieldsets, section headers, dialog shells, close buttons, layout wrappers), extract a component. Split big components (roughly 150+ lines, or more than one responsibility) into smaller ones in the same feature folder.
6. **Handlers belong to the component that uses them.** If a parent defines a function or state only to pass it to one child, move it into that child. For example, a button that opens a dialog owns the `isOpen` state and renders the dialog itself.
7. **Contexts instead of prop drilling.** When state or callbacks pass through components that don't use them, or the same values are passed into several components, create a context. Passing a prop down one level to its direct user is fine.
8. **SOLID.** One responsibility per file, function and component. Depend on small typed interfaces. Prefer composition (children and slots) over flags that switch behaviour. Replace parallel booleans with one union type (for example `BracketMode = 'recorded' | 'projected' | 'resimulated'` instead of `isProjected` plus `isResimulated`).
9. **Remove dead code** left behind by a change: unused props, options, CSS classes, exports and imports.
10. **Keep behaviour identical** during cleanup. Treat any bug you notice as a separate, explicitly reported fix, not a silent change.

## Architecture

Follow the existing layout (also documented in `README.md`, "Project structure"). Update that README section whenever you add or rename a folder.

```
src/
  App.tsx          Providers plus page switch only
  pages/           Top-level pages; compose layout and feature components
  components/
    common/        Generic reusable UI (Modal, CloseButton, Panel, Toggle, ...)
    icons/         One SVG icon component per file
    layout/        Page chrome (Navbar, PageContent)
    <feature>/     Feature components, each with its own .css next to it
  context/         xxxContext.ts (createContext plus useXxx hook) and XxxProvider.tsx
  hooks/           React hooks; a hook exports its state interface (e.g. LeagueSettingsState)
  domain/          Pure logic: no React, no fetch, no storage
  services/        Loading, caching and orchestration (api plus domain plus storage)
  api/<source>/    *Api (HTTP calls), *Dto (response types), *Mappers (DTO to model)
  types/models.ts  Shared models
  constants/       Static data and constant values only
  utils/           Generic helpers not tied to fantasy football
  styles/          Global tokens and shared building blocks
```

Placement guide:
- Pure calculation about matchups, records, scoring or playoffs → `domain/`
- Talking to an API, localStorage or a cache → `services/` (with generic cache mechanics in `utils/`)
- UI-only layout helpers for one feature (grouping, grid cells, labels) → a `.ts` file inside that feature folder, like `components/playoffs/playoffLabels.ts`
- Stateful UI logic such as a form draft → a hook in `hooks/`

## Conventions to match

- **Context pattern:** `context/fooContext.ts` exports `FooContext` and a `useFooContext()` hook. Throw a clear error when a required context is missing; return `null` when missing is a valid state. `context/FooProvider.tsx` calls the underlying hook and provides the value.
- **Components:** named exports, `interface XxxProps` directly above, props destructured in the signature, and the CSS imported last as `import './Xxx.css'`. Give CSS classes component-named prefixes (`.setting-row`, `.close-button`). When you move markup into a new component, move its CSS into that component's file.
- **CSS spacing:** put space between siblings with `display: flex` (or `grid`) and `gap` on the parent, not with `margin` on the children. A parent's gap keeps spacing in one place and doesn't leave stray space on the first or last item. Keep `padding` for a box's own inner space (for example a panel's or button's edges), not for pushing neighbours apart.
- **CSS positioning:** don't use `position: absolute` when normal layout can do it. Flex or grid alignment (`justify-content`, `align-items`, `margin-left: auto` in a flex row, `grid-column`) covers most cases. Keep `absolute` for real overlays: badges or dots on an icon corner, decorative pseudo-elements, tooltips and popovers.
- **Imports:** sorted by path the way the existing files are; no unused imports.
- **Naming:** functions start with a verb (`getX`, `toX` for mapping, `loadX` in services, `fetchX` for a single remote call, `withX` for an enriched copy). Booleans read as `isX`, `hasX` or `canX`.
- **Hooks own derived state.** Things like "keep showing the last result while the next one loads" go in the hook, not in the component.

## Workflow for a cleanup request

1. Run `npx tsc -b` and `npx eslint src` first so you know the baseline.
2. Read the diff (`git diff` plus untracked files) and the files it touches. List concrete targets for each rule above before editing.
3. Refactor layer by layer: app shell and contexts, then components, then domain, then services. Typecheck after each layer.
4. Search for leftover references to renamed or removed things: old CSS classes, props, functions.
5. Finish with `npx tsc -b`, `npx eslint src`, `npm run build`, then check the affected screens in the browser preview. Use `.claude/launch.json` (`dev`). For testing, search the Sleeper username `Gabcool2001` (or open `/?user=Gabcool2001`). Pick a league and season with played games so matchups, lineups, the leaderboard, playoffs and the league settings dialog can all be exercised. If you change league settings while testing, reset them to league defaults afterwards.
6. Report the changes by rule (comments, duplicates, moved code, new components, contexts), mention any bugs you fixed, and list anything you deliberately left alone and why.

import './HomePage.css';
import { AppName } from '../common/AppName';
import { UsernameForm } from '../search/UsernameForm';
import { Play, PlayDiagram } from './PlayDiagram';

interface HomePageProps {
  loading: boolean;
  onSearch: (username: string) => void;
}

const FEATURES: { play: Play; title: string; text: string }[] = [
  {
    play: 'headToHead',
    title: 'Weekly results',
    text: 'Every matchup of the season with scores, projections and full lineups for both teams.',
  },
  {
    play: 'crossingRoutes',
    title: 'Swap schedules',
    text: "See how your team would have done playing someone else's schedule, week by week.",
  },
  {
    play: 'climb',
    title: 'Smarter leaderboard',
    text: 'Sort by record, points for, strength of schedule, bench points and luck.',
  },
  {
    play: 'liveMotion',
    title: 'Live current week',
    text: 'Follow this week as it happens, with projected points and a weekly scoring chart.',
  },
];

const STEPS = [
  { down: '1st', title: 'Enter a username', text: 'Any Sleeper username works: yours, a leaguemate’s or a friend’s.' },
  { down: '2nd', title: 'Pick a league', text: 'Choose the league and season you want to look at.' },
  { down: '3rd', title: 'Explore', text: 'Browse matchups, compare teams and share the link.' },
];

const YARD_LINES = [10, 20, 30, 40, 50, 40, 30, 20, 10];

export function HomePage({ loading, onSearch }: HomePageProps) {
  return (
    <div className="home">
      <h1 className="home-brand"><AppName /></h1>

      <section className="home-hero on-turf">
        <div className="home-yard-numbers" aria-hidden="true">
          {YARD_LINES.map((yards, i) => <span key={i}>{yards}</span>)}
        </div>
        <p className="home-eyebrow live-chip">The season is under review</p>
        <h2 className="home-title">
          Was it skill, or <span className="home-title-accent">schedule luck</span>?
        </h2>
        <UsernameForm inputId="home-username-input" variant="hero" loading={loading} onSubmit={onSearch} autoFocus />
      </section>

      <section className="home-features" aria-label="Features">
        {FEATURES.map((f) => (
          <article key={f.title} className="panel home-feature">
            <span className="home-feature-play"><PlayDiagram play={f.play} /></span>
            <h3 className="home-feature-title">{f.title}</h3>
            <p className="home-feature-text">{f.text}</p>
          </article>
        ))}
      </section>

      <section className="home-steps" aria-labelledby="home-steps-title">
        <h3 id="home-steps-title" className="section-title">How it works</h3>
        <ol className="home-steps-list">
          {STEPS.map((s) => (
            <li key={s.title} className="home-step">
              <span className="home-step-down" aria-hidden="true">
                <span className="home-step-down-number">{s.down}</span>
                <span className="home-step-down-label">down</span>
              </span>
              <div>
                <p className="home-step-title">{s.title}</p>
                <p className="home-step-text">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

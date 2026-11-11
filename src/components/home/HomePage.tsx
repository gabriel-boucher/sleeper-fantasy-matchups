import './HomePage.css';
import { UsernameForm } from '../search/UsernameForm';

interface HomePageProps {
  loading: boolean;
  onSearch: (username: string) => void;
}

const FEATURES = [
  {
    icon: '📅',
    title: 'Weekly results',
    text: 'Every matchup of the season with scores, projections and full lineups for both teams.',
  },
  {
    icon: '🔀',
    title: 'Swap schedules',
    text: "See how your team would have done playing someone else's schedule, week by week.",
  },
  {
    icon: '🏆',
    title: 'Smarter leaderboard',
    text: 'Sort by record, points for, strength of schedule, bench points and luck.',
  },
  {
    icon: '📈',
    title: 'Live current week',
    text: 'Follow this week as it happens, with projected points and a weekly scoring chart.',
  },
];

const STEPS = [
  { title: 'Enter a username', text: 'Any Sleeper username works: yours, a leaguemate’s or a friend’s.' },
  { title: 'Pick a league', text: 'Choose the league and season you want to look at.' },
  { title: 'Explore', text: 'Browse matchups, compare teams and share the link.' },
];

export function HomePage({ loading, onSearch }: HomePageProps) {
  return (
    <div className="home">
      <section className="home-hero">
        <h2 className="home-title">
          Was it skill, or <span className="home-title-accent">schedule luck</span>?
        </h2>
        <p className="home-lead">
          See any Sleeper team's weekly results, or how it would have done against someone else's schedule.
        </p>
        <UsernameForm id="home-username-input" variant="hero" loading={loading} onSubmit={onSearch} autoFocus />
      </section>

      <section className="home-features" aria-label="Features">
        {FEATURES.map((f) => (
          <article key={f.title} className="panel home-feature">
            <span className="home-feature-icon" aria-hidden="true">{f.icon}</span>
            <h3 className="home-feature-title">{f.title}</h3>
            <p className="home-feature-text">{f.text}</p>
          </article>
        ))}
      </section>

      <section className="home-steps" aria-labelledby="home-steps-title">
        <h3 id="home-steps-title" className="section-title">How it works</h3>
        <ol className="home-steps-list">
          {STEPS.map((s, i) => (
            <li key={s.title} className="home-step">
              <span className="home-step-number" aria-hidden="true">{i + 1}</span>
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

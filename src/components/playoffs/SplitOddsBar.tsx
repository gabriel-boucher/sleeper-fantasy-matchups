import { formatPercent } from '../../utils/format';
import './SplitOddsBar.css';

const ONE_PERCENT = 0.01;

interface SplitOddsBarProps {
  goodLabel: string;
  goodChance: number;
  badLabel: string;
  badChance: number;
}

function formatChance(chance: number): string {
  if (chance > 0 && chance < ONE_PERCENT) return '<1%';
  if (chance < 1 && chance > 1 - ONE_PERCENT) return '>99%';
  return formatPercent(chance);
}

function formatShownChance(chance: number): string {
  return chance > 0 ? formatChance(chance) : '';
}

export function SplitOddsBar({ goodLabel, goodChance, badLabel, badChance }: SplitOddsBarProps) {
  const summary = `${goodLabel} ${formatChance(goodChance)} · ${badLabel} ${formatChance(badChance)}`;
  return (
    <span className="split-odds-bar" title={summary}>
      <span className="split-odds-track" aria-hidden="true">
        <span className="split-odds-fill good" style={{ width: formatPercent(goodChance, 1) }} />
        <span className="split-odds-fill bad" style={{ width: formatPercent(badChance, 1) }} />
      </span>
      <span className="split-odds-values" aria-hidden="true">
        <span className="split-odds-value good">{formatShownChance(goodChance)}</span>
        <span className="split-odds-value bad">{formatShownChance(badChance)}</span>
      </span>
      <span className="visually-hidden">{summary}</span>
    </span>
  );
}

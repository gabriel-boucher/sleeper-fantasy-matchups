export function sumBy<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

export function getAverage(values: number[]): number {
  return sumBy(values, value => value) / values.length;
}

const ABRAMOWITZ_STEGUN_P = 0.2316419;
const ABRAMOWITZ_STEGUN_COEFFICIENTS = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];

export function getNormalCdf(z: number): number {
  const t = 1 / (1 + ABRAMOWITZ_STEGUN_P * Math.abs(z));
  const density = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  const polynomial = ABRAMOWITZ_STEGUN_COEFFICIENTS.reduceRight((sum, coefficient) => coefficient + t * sum, 0);
  const tail = density * t * polynomial;
  return z >= 0 ? 1 - tail : tail;
}

export function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

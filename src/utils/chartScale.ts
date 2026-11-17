const READABLE_STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10];

export interface AxisScale {
  min: number;
  max: number;
  ticks: number[];
}

export function getReadableAxisScale(dataMin: number, dataMax: number, tickCount: number): AxisScale {
  const range = Math.max(dataMax - dataMin, 1);
  const roughStep = range / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = READABLE_STEP_MULTIPLIERS.map(multiplier => multiplier * magnitude).find(s => s >= roughStep)!;
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step);
  return { min, max: max === min ? min + step : max, ticks };
}

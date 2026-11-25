export type Random = () => number;

const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 2 ** 32;

export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

export function drawNormal(random: Random, mean: number, spread: number): number {
  const radius = Math.sqrt(-2 * Math.log(1 - random()));
  return mean + spread * radius * Math.cos(2 * Math.PI * random());
}

import { Chain, Hub, Accumulator, Filter } from '..';

export const Muxer = (...inputs) => Chain(
  Hub(...inputs),
  Accumulator(),
  Filter(v => inputs.every(i => v[i] !== undefined))
);
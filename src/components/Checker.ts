import { Chain, Mapper, Demuxer } from '..';

export const Checker = cond => Chain(
  Mapper(v => cond(v) ? { true: v } : { false: v }),
  Demuxer('true', 'false')
);
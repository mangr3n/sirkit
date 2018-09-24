import { Component } from './Component';
import { is, map, toPairs, assoc } from 'ramda';

export { Component } from './Component';

export { Accumulator } from './components/Accumulator';
export { Chain } from './components/Chain';
export { Demuxer } from './components/Demuxer';
export { Checker } from './components/Checker';
export { Counter } from './components/Counter';
export { Delayer } from './components/Delayer';
export { Guard } from './components/Guard';
export { Hub } from './components/Hub';
export { Iterator } from './components/Iterator';
export { Memorizer } from './components/Memorizer';
export { Muxer } from './components/Muxer';
export { Serializer } from './components/Serializer';
export { UniqueFilter } from './components/UniqueFilter';
export const Mapper = (fn) => Component((v, next) => next(fn(v)), { name: `Mapper(${fn.name})` });
export const Identity = (name = "Identity") => Component(name, (v, next) => next(v));
export const Filter = (cond) => Component((v, next) => { if (cond(v)) next(v) });
export const Repeater = (times) => Component((v, next) => {
  for (let i = 0; i <= times; i++) next(v);
});
export const Ticker = (ms, { value = {}, initialDelay = false } = { value: {}, initialDelay: false }) => {
  return Component((v, next) => {
    if (!initialDelay) next(value)
    setInterval(() => next(value), ms);
  });
};


import { Component } from '..';

export const Iterator = (iterable, { cyclic = false } = {}) => {
  let iterator = iterable[Symbol.iterator]();
  return Component((v, next) => {
    let { value, done } = iterator.next();
    if (done && cyclic) {
      iterator = iterable[Symbol.iterator]();
      ({ value, done } = iterator.next());
    }
    if (!done) next(value);
  });
};
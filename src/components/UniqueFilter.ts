import { Component } from '..';

export const UniqueFilter = initialValue => {
  let lastValue = initialValue;
  return Component((v, next) => {
    if (v !== lastValue) {
      lastValue = v;
      next(v);
    }
  });
};
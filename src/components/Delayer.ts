import { Component } from '..';

export const Delayer = ms => Component((v, next) => {
  setTimeout(() => next(v), ms);
});
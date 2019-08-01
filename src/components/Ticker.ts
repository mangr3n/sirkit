import {Component} from "../Component";

export const Ticker = (ms, { value = {}, initialDelay = false } = { value: {}, initialDelay: false }) => {
  return Component((v, next) => {
    if (!initialDelay) next(value);
    setInterval(() => next(value), ms);
  });
};

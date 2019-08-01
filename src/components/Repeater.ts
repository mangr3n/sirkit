import {Component} from "../Component";

export const Repeater = (times) => Component((v, next) => {
  for (let i = 0; i <= times; i++) next(v);
});
